import { DeadlineRule } from "../../types";

export const deadlineRules: DeadlineRule[] = [
  {
    serviceTypeId: "PROPERTY_TITLE",
    periodDescription: "3 years from the date ownership was first questioned",
    startEvent: "Date when ownership was first disputed or challenged"
  },
  {
    serviceTypeId: "PROPERTY_PARTITION",
    periodDescription: "No strict limitation — but long delays can be challenged on grounds of laches (unexplained delay)",
    startEvent: "Date co-owner first refused to partition or share"
  },
  {
    serviceTypeId: "PROPERTY_ENCROACHMENT",
    periodDescription: "12 years from the date of dispossession (adverse possession rule)",
    startEvent: "Date the encroacher first occupied or took possession"
  },
  {
    serviceTypeId: "RENT_TENANCY",
    periodDescription: "3 years for arrears of rent. Eviction under Karnataka Rent Act has its own timelines.",
    startEvent: "Date rent first fell due and was not paid"
  },
  {
    serviceTypeId: "FAMILY_SUCCESSION",
    periodDescription: "3 years to contest a will from probate. 12 years for recovery of inherited property.",
    startEvent: "Date of death or date of probate grant, whichever applies"
  },
  {
    serviceTypeId: "CIVIL_CONTRACT",
    periodDescription: "3 years from the date of breach of contract",
    startEvent: "Date the other party first breached the agreement"
  },
  {
    serviceTypeId: "CIVIL_INJUNCTION",
    periodDescription: "No fixed period — courts look at urgency and balance of convenience",
    startEvent: "Urgency and ongoing harm are the key factors, not a fixed deadline"
  },
  {
    serviceTypeId: "RERA_BUILDER",
    periodDescription: "1 year from the date of possession promised OR date defect was discovered",
    startEvent: "Promised possession date in the sale agreement"
  },
  {
    serviceTypeId: "CHEQUE_BOUNCE",
    periodDescription: "CRITICAL: 30 days to send legal notice after receiving bank return memo. Then 15 days for accused to pay. Case must be filed within 1 month of expiry of 15-day notice period.",
    startEvent: "Date of bank return memo showing cheque dishonoured"
  },
  {
    serviceTypeId: "DOCUMENTATION",
    periodDescription: "No limitation period — this is a service request, not a dispute",
    startEvent: "Not applicable"
  }
];
