from typing import List
from models import UserSettings, IncomeStream, Deduction, AnnualSummary

def get_annual_amount(amount: float, freq_value: float, freq_unit: str) -> float:
    multipliers = {
        'week': 52,
        'fortnight': 26,
        'month': 12,
        'quarter': 4,
        'year': 1
    }
    if freq_value == 0: return 0
    return (amount * multipliers.get(freq_unit, 1)) / freq_value

def calculate_tax_summary(settings: UserSettings, incomes: List[IncomeStream], deductions: List[Deduction]) -> AnnualSummary:
    total_gross = 0
    total_taxable = 0
    total_super = 0
    total_packaging = 0
    total_admin_fees = 0
    
    # 1. Aggregate Incomes
    for inc in incomes:
        annual_gross = get_annual_amount(inc.amount, inc.freqValue, inc.freqUnit)
        
        # Super
        super_contribution = annual_gross * (inc.superRate / 100)
        
        # Taxable Income Calculation
        # For Salary: Gross - Packaging - AdminFee
        # For ABN: Gross (assuming expenses handled elsewhere or passed as net, but here we treat as gross)
        
        taxable_component = annual_gross
        
        if inc.type == 'salary':
            taxable_component -= inc.salaryPackaging
            taxable_component -= inc.adminFee
            total_packaging += inc.salaryPackaging
            total_admin_fees += inc.adminFee
            
        total_gross += annual_gross
        total_taxable += taxable_component
        total_super += super_contribution

    # 2. Deductions
    total_deductions = sum(d.amount for d in deductions)
    total_taxable -= total_deductions
    total_taxable = max(0, total_taxable)
    
    # 3. Calculate Tax (2024-25 Resident Rates)
    # 0 - 18,200: 0%
    # 18,201 - 45,000: 16%
    # 45,001 - 135,000: 30%
    # 135,001 - 190,000: 37%
    # 190,001+: 45%
    
    income_tax = 0
    if settings.isResident:
        if total_taxable > 190000:
            income_tax = 51638 + (total_taxable - 190000) * 0.45
        elif total_taxable > 135000:
            income_tax = 31288 + (total_taxable - 135000) * 0.37
        elif total_taxable > 45000:
            income_tax = 4288 + (total_taxable - 45000) * 0.30
        elif total_taxable > 18200:
            income_tax = (total_taxable - 18200) * 0.16
    else:
        # Non-resident rates (simplified)
        if total_taxable > 190000:
            income_tax = 60850 + (total_taxable - 190000) * 0.45
        elif total_taxable > 135000:
            income_tax = 40500 + (total_taxable - 135000) * 0.37
        else:
            income_tax = total_taxable * 0.30

    # 4. Medicare Levy (2%)
    medicare_levy = 0
    if settings.isResident and total_taxable > 26000:
        medicare_levy = total_taxable * 0.02
        
    # 5. Medicare Levy Surcharge (MLS)
    # Income for MLS = Taxable Income + Reportable Fringe Benefits (Grossed Up) + Super (if applicable, simplified here)
    # RFBA Gross Up Factor ~ 1.8868
    rfba = total_packaging * 1.8868
    mls_income = total_taxable + rfba
    
    mls = 0
    if settings.isResident and not settings.hasPrivateHealth:
        if mls_income > 151000:
            mls = total_taxable * 0.015
        elif mls_income > 113000:
            mls = total_taxable * 0.0125
        elif mls_income > 97000:
            mls = total_taxable * 0.01
            
    # 6. HECS/HELP Repayment
    # Repayment Income = Taxable + RFBA + Net Investment Loss (ignored) + Reportable Super (ignored)
    hecs_income = total_taxable + rfba
    hecs = 0
    if settings.hasHecsDebt:
        if hecs_income > 151201: hecs = hecs_income * 0.10
        elif hecs_income > 100000: hecs = hecs_income * 0.06
        elif hecs_income > 54435: hecs = hecs_income * 0.01
        
    total_tax = income_tax + medicare_levy + mls + hecs
    
    # Net Income = Gross - Tax - Packaging - AdminFees (Cash in hand)
    # Note: Packaging is deducted from gross cash flow as it goes to the benefit provider
    net_income = total_gross - total_tax - total_packaging - total_admin_fees
    
    return AnnualSummary(
        gross_income=total_gross,
        taxable_income=total_taxable,
        income_tax=income_tax,
        medicare_levy=medicare_levy,
        medicare_levy_surcharge=mls,
        hecs_repayment=hecs,
        total_tax=total_tax,
        net_income=net_income,
        super_contribution=total_super,
        total_expenses=0, # Filled later
        surplus=0 # Filled later
    )
