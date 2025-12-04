from pydantic import BaseModel
from typing import List, Optional, Literal

# --- Enums & Types ---
FrequencyUnit = Literal['week', 'fortnight', 'month', 'quarter', 'year']
IncomeType = Literal['salary', 'abn', 'other']
TaxTreatment = Literal['tft', 'no-tft', 'abn']
RepaymentFrequency = Literal['week', 'fortnight', 'month']

class UserSettings(BaseModel):
    name: str = ""
    isResident: bool = True
    hasPrivateHealth: bool = False
    hasHecsDebt: bool = False
    isRenting: bool = False

class IncomeStream(BaseModel):
    id: str
    name: str
    type: IncomeType
    amount: float
    freqValue: float
    freqUnit: FrequencyUnit
    taxTreatment: TaxTreatment
    salaryPackaging: float = 0.0
    adminFee: float = 0.0
    superRate: float = 11.5
    paygOverride: Optional[float] = None

class Deduction(BaseModel):
    id: str
    name: str
    amount: float
    category: str

class ExpenseItem(BaseModel):
    id: str
    name: str
    amount: float
    freqValue: float
    freqUnit: FrequencyUnit
    category: str
    isMortgageLink: bool = False

class Asset(BaseModel):
    id: str
    name: str
    value: float
    category: str
    growthRate: float

class MortgageParams(BaseModel):
    principal: float
    offsetBalance: float
    interestRate: float
    loanTermYears: int
    userRepayment: Optional[float] = None
    repaymentFreq: RepaymentFrequency = 'month'
    propertyValue: float
    growthRate: float
    useBudgetRepayment: bool = True
    useSurplus: bool = False

class CalculationRequest(BaseModel):
    userSettings: UserSettings
    incomes: List[IncomeStream]
    deductions: List[Deduction]
    expenses: List[ExpenseItem]
    assets: List[Asset]
    mortgageParams: MortgageParams
    fireTargetOverride: Optional[float] = None

# --- Response Models ---

class AnnualSummary(BaseModel):
    gross_income: float
    taxable_income: float
    income_tax: float
    medicare_levy: float
    medicare_levy_surcharge: float
    hecs_repayment: float
    total_tax: float
    net_income: float
    super_contribution: float
    total_expenses: float
    surplus: float

class MortgageYearResult(BaseModel):
    year: float
    balanceStandard: int
    balanceActual: int
    property: int
    equity: int
    redraw: int

class NetWorthYearResult(BaseModel):
    year: int
    netWorth: int
    debt: int
    fireTarget: int
    velocity: int

class MortgageMechanics(BaseModel):
    min_repayment: float
    budget_repayment: float
    actual_repayment: float
    first_period_interest: float
    max_capacity: float

class CategorySplit(BaseModel):
    name: str
    value: float

class ExpenseAnalysis(BaseModel):
    category_split: List[CategorySplit]
    total_annual: float

class CalculationResponse(BaseModel):
    annual_summary: AnnualSummary
    mortgage_projection: List[MortgageYearResult]
    net_worth_projection: List[NetWorthYearResult]
    mortgage_mechanics: MortgageMechanics
    expense_analysis: ExpenseAnalysis
