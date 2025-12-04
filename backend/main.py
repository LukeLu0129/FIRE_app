from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import CalculationRequest, CalculationResponse, ExpenseAnalysis, CategorySplit, UserSettings, IncomeStream, Deduction, ExpenseItem, Asset, MortgageParams
from tax_engine import calculate_tax_summary, get_annual_amount
from projection_engine import run_projections

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_STATE = CalculationRequest(
    userSettings=UserSettings(
        name='', 
        isResident=True, 
        hasPrivateHealth=False, 
        hasHecsDebt=False, 
        isRenting=False
    ),
    incomes=[
        IncomeStream(
            id='1', 
            name='Primary Salary', 
            type='salary', 
            amount=120000, 
            freqValue=1, 
            freqUnit='year', 
            taxTreatment='tft', 
            salaryPackaging=0, 
            adminFee=0, 
            superRate=11.5, 
            paygOverride=None
        )
    ],
    deductions=[],
    expenses=[
        ExpenseItem(
            id='1', 
            name='Mortgage Repayment', 
            amount=3500, 
            freqValue=1, 
            freqUnit='month', 
            category='Mortgage/Rent', 
            isMortgageLink=True
        ),
        ExpenseItem(
            id='2', 
            name='Groceries', 
            amount=200, 
            freqValue=1, 
            freqUnit='week', 
            category='Food', 
            isMortgageLink=False
        )
    ],
    assets=[
        Asset(
            id='1', 
            name='Vanguard ETF (VGS)', 
            value=20000, 
            category='Shares', 
            growthRate=7.0
        ),
        Asset(
            id='2', 
            name='Savings Account', 
            value=20000, 
            category='Cash', 
            growthRate=4.5
        )
    ],
    mortgageParams=MortgageParams(
        principal=500000, 
        offsetBalance=20000, 
        interestRate=6.0, 
        loanTermYears=30, 
        userRepayment=None, 
        repaymentFreq='month', 
        propertyValue=600000, 
        growthRate=3.0, 
        useBudgetRepayment=True, 
        useSurplus=False
    ),
    fireTargetOverride=None
)

# Additional default lists that aren't part of the calculation request but needed for UI
DEFAULT_EXPENSE_CATEGORIES = ['Mortgage/Rent', 'Food', 'Transport', 'Utilities', 'Insurance', 'Health', 'Entertainment', 'Debt', 'Savings', 'Other']
DEFAULT_ASSET_CATEGORIES = ['Shares', 'Cash', 'Crypto', 'Property (Inv)', 'Collectibles', 'Other']

@app.get("/")
def read_root():
    return {"message": "Start your FIRE API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/defaults")
def get_defaults():
    # Return the default state plus the category lists
    return {
        **DEFAULT_STATE.model_dump(),
        "expenseCategories": DEFAULT_EXPENSE_CATEGORIES,
        "assetCategories": DEFAULT_ASSET_CATEGORIES
    }

@app.post("/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    # 1. Calculate Tax & Annual Summary
    summary = calculate_tax_summary(request.userSettings, request.incomes, request.deductions)
    
    # 2. Run Projections (Mortgage & Net Worth)
    mortgage_proj, net_worth_proj, mechanics = run_projections(request, summary)
    
    # 3. Expense Analysis (Pie Chart Data)
    cat_map = {}
    total_exp = 0
    for exp in request.expenses:
        val = get_annual_amount(exp.amount, exp.freqValue, exp.freqUnit)
        cat_map[exp.category] = cat_map.get(exp.category, 0) + val
        total_exp += val
        
    expense_analysis = ExpenseAnalysis(
        category_split=[CategorySplit(name=k, value=v) for k,v in cat_map.items()],
        total_annual=total_exp
    )
    
    return CalculationResponse(
        annual_summary=summary,
        mortgage_projection=mortgage_proj,
        net_worth_projection=net_worth_proj,
        mortgage_mechanics=mechanics,
        expense_analysis=expense_analysis
    )
