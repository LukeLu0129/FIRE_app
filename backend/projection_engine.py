import math
from typing import List, Tuple
from models import CalculationRequest, MortgageYearResult, NetWorthYearResult, AnnualSummary, MortgageMechanics
from tax_engine import get_annual_amount

def calculate_pmt(rate: float, nper: int, pv: float) -> float:
    if rate == 0: return pv / nper
    pvif = math.pow(1 + rate, nper)
    return (rate * pv * pvif) / (pvif - 1)

def run_projections(request: CalculationRequest, summary: AnnualSummary) -> Tuple[List[MortgageYearResult], List[NetWorthYearResult], MortgageMechanics]:
    # --- 1. Calculate Expenses & Surplus ---
    total_expenses = 0
    budgeted_mortgage_annual = 0
    annual_expenses_excl_mortgage = 0
    
    for exp in request.expenses:
        annual_cost = get_annual_amount(exp.amount, exp.freqValue, exp.freqUnit)
        total_expenses += annual_cost
        if exp.isMortgageLink:
            budgeted_mortgage_annual += annual_cost
        else:
            annual_expenses_excl_mortgage += annual_cost
            
    summary.total_expenses = total_expenses
    summary.surplus = max(0, summary.net_income - total_expenses)
    
    # --- 2. Mortgage Projection Setup ---
    mp = request.mortgageParams
    
    # Determine frequency scalar
    n_per_year = 12
    if mp.repaymentFreq == 'week': n_per_year = 52
    elif mp.repaymentFreq == 'fortnight': n_per_year = 26
    
    period_rate = mp.interestRate / 100 / n_per_year
    total_periods = mp.loanTermYears * n_per_year
    
    # Calculate Min Repayment (in selected frequency)
    min_repayment = calculate_pmt(period_rate, total_periods, mp.principal)
    
    # Calculate Budgeted Repayment (in selected frequency)
    budget_repayment = budgeted_mortgage_annual / n_per_year
    
    # Determine Actual Repayment (in selected frequency)
    if mp.userRepayment is not None:
        actual_repayment = mp.userRepayment
    else:
        actual_repayment = budget_repayment
        
    # Ensure we at least meet min repayment if using budget/surplus logic? 
    # The frontend logic says: "if (actualAnnualRepayment < minRepaymentAnnual) actualAnnualRepayment = minRepaymentAnnual;"
    # Let's enforce that here too.
    actual_repayment = max(actual_repayment, min_repayment)
    
    first_period_interest = (mp.principal - mp.offsetBalance) * period_rate
    
    # Max Capacity (Surplus + Budgeted Mortgage) / n_per_year
    max_capacity = (summary.surplus + budgeted_mortgage_annual) / n_per_year

    mechanics = MortgageMechanics(
        min_repayment=min_repayment,
        budget_repayment=budget_repayment,
        actual_repayment=actual_repayment,
        first_period_interest=first_period_interest,
        max_capacity=max_capacity
    )

    # --- 3. Run Mortgage Simulation (Monthly Steps for Chart Consistency) ---
    # We will simulate monthly for the charts, converting the user's chosen frequency amounts to monthly equivalents.
    
    mortgage_data = []
    bal_standard = mp.principal
    bal_actual = mp.principal
    prop_val = mp.propertyValue
    
    # Convert everything to monthly for the loop
    monthly_rate = mp.interestRate / 100 / 12
    freq_to_monthly = n_per_year / 12
    
    monthly_repay_min = min_repayment * freq_to_monthly
    monthly_repay_actual = actual_repayment * freq_to_monthly
    
    simulated_assets = [a.model_copy() for a in request.assets]
    
    # Real Annual Cost of Mortgage (Actual)
    real_annual_mortgage_cost = monthly_repay_actual * 12
    
    # Real Surplus available for investment (Net Income - Living Expenses - Actual Mortgage)
    # If renting, mortgage cost is 0 (handled by caller usually, but let's check flag)
    # Actually, if renting, mp.principal might be 0 or ignored.
    
    real_surplus_annual = max(0, summary.net_income - annual_expenses_excl_mortgage - real_annual_mortgage_cost)
    
    # Wealth Velocity: Annual Surplus + Principal Paydown (Year 1 approx)
    # Principal Paydown = Annual Repayment - Interest
    initial_interest_annual = (mp.principal - mp.offsetBalance) * (mp.interestRate / 100)
    initial_principal_paid = max(0, real_annual_mortgage_cost - initial_interest_annual)
    if request.userSettings.isRenting:
        initial_principal_paid = 0
        
    initial_velocity = real_surplus_annual + initial_principal_paid
    
    # FIRE Target
    if request.fireTargetOverride is not None:
        fire_target = request.fireTargetOverride
    else:
        # Default: 25x Total Expenses (Living + Mortgage if it exists? Usually FIRE expenses exclude mortgage if paid off)
        # But standard rule is 25x current expenses.
        # Let's use the logic: 25 * (Living + Mortgage)
        fire_target = (annual_expenses_excl_mortgage + real_annual_mortgage_cost) * 25

    net_worth_data = []
    total_months = mp.loanTermYears * 12
    
    for m in range(total_months + 1):
        year = m / 12
        
        if m % 12 == 0:
            mortgage_data.append(MortgageYearResult(
                year=year,
                balanceStandard=round(bal_standard),
                balanceActual=round(bal_actual),
                property=round(prop_val),
                equity=round(prop_val - bal_actual),
                redraw=max(0, round(bal_standard - bal_actual))
            ))
            
            total_assets_val = sum(a.value for a in simulated_assets)
            
            # Dynamic FIRE Target? Or Static?
            # User code uses static target based on Year 0 expenses usually, or dynamic if expenses change.
            # Let's keep it simple: Static Target or Override.
            
            net_worth_data.append(NetWorthYearResult(
                year=int(year),
                netWorth=round((prop_val + total_assets_val) - bal_actual),
                debt=round(bal_actual),
                fireTarget=round(fire_target),
                velocity=round(initial_velocity) # Static velocity for now, or could recalculate
            ))
            
            if m > 0:
                for asset in simulated_assets:
                    asset.value *= (1 + asset.growthRate / 100)
                
                # Inject Surplus
                injection = real_surplus_annual
                if bal_actual <= 0 and not request.userSettings.isRenting:
                    injection += real_annual_mortgage_cost # Redirect mortgage payments to savings
                
                if simulated_assets:
                    simulated_assets[0].value += injection

        if m < total_months:
            prop_val *= math.pow(1 + (mp.growthRate / 100), 1/12)
            
            if bal_standard > 0:
                int_std = bal_standard * monthly_rate
                bal_standard = bal_standard + int_std - monthly_repay_min
                if bal_standard < 0: bal_standard = 0
            
            if bal_actual > 0:
                effective_principal = max(0, bal_actual - mp.offsetBalance)
                int_act = effective_principal * monthly_rate
                bal_actual = bal_actual + int_act - monthly_repay_actual
                if bal_actual < 0: bal_actual = 0
    
    return mortgage_data, net_worth_data, mechanics
