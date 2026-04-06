import { ForumRoute } from "../../types";

export const forumRoutes: ForumRoute[] = [
  {
    serviceTypeId: "PROPERTY_TITLE",
    forum: "City Civil Court, Bangalore (for suits above Rs. 20 lakh) OR Civil Judge Court (for suits below Rs. 20 lakh)",
    conditions: "Jurisdiction depends on the market value of the property in dispute"
  },
  {
    serviceTypeId: "PROPERTY_PARTITION",
    forum: "City Civil Court, Bangalore",
    conditions: "If property is in rural area, Sub-Court or Munsiff Court may have jurisdiction"
  },
  {
    serviceTypeId: "PROPERTY_ENCROACHMENT",
    forum: "Civil Court for injunction + Revenue Court / Tahsildar for boundary disputes",
    conditions: "Two parallel proceedings are often needed — civil court for injunction, revenue for survey"
  },
  {
    serviceTypeId: "RENT_TENANCY",
    forum: "Small Causes Court, Bangalore (for eviction and rent recovery)",
    conditions: "Karnataka Rent Act applies to most residential and older commercial tenancies"
  },
  {
    serviceTypeId: "FAMILY_SUCCESSION",
    forum: "City Civil Court or Family Court, Bangalore",
    conditions: "Family Court handles matrimonial aspects; City Civil Court handles property succession"
  },
  {
    serviceTypeId: "CIVIL_CONTRACT",
    forum: "City Civil Court, Bangalore (above Rs. 20 lakh) OR Commercial Court (if commercial dispute above Rs. 3 lakh)",
    conditions: "Commercial Court has faster timelines under Commercial Courts Act 2015"
  },
  {
    serviceTypeId: "CIVIL_INJUNCTION",
    forum: "City Civil Court, Bangalore — file for temporary injunction urgently",
    conditions: "Temporary injunction can be obtained on the same day in urgent cases"
  },
  {
    serviceTypeId: "RERA_BUILDER",
    forum: "Karnataka Real Estate Regulatory Authority (K-RERA), Bangalore",
    conditions: "Only applies to RERA-registered projects. Check RERA Karnataka website for project registration."
  },
  {
    serviceTypeId: "CHEQUE_BOUNCE",
    forum: "Judicial Magistrate First Class (JMFC) Court — jurisdiction where cheque was presented for payment",
    conditions: "After Supreme Court ruling, jurisdiction is where cheque was presented at bank, not where issued"
  },
  {
    serviceTypeId: "DOCUMENTATION",
    forum: "Not applicable — this is a drafting service, no court filing needed",
    conditions: "If document requires registration, Sub-Registrar Office, Bangalore"
  }
];
