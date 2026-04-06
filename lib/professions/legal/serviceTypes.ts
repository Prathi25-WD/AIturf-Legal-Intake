import { ServiceType } from "../../types";

export const serviceTypes: ServiceType[] = [
  {
    id: "PROPERTY_TITLE",
    label: "Property Title Dispute",
    description: "Ownership disputes, title challenges, sale deed conflicts",
    keyQuestions: [
      "Do you have a sale deed or title document?",
      "Who is challenging your ownership and on what basis?",
      "When did the dispute first arise?",
      "Is there a pending transaction (sale/purchase) being blocked?"
    ]
  },
  {
    id: "PROPERTY_PARTITION",
    label: "Property Partition",
    description: "Division of joint family or ancestral property among co-owners",
    keyQuestions: [
      "How many co-owners or family members are involved?",
      "Is there a will or family settlement agreement?",
      "What properties are involved — house, land, or both?",
      "Is everyone agreeing to partition or is someone refusing?"
    ]
  },
  {
    id: "PROPERTY_ENCROACHMENT",
    label: "Property Encroachment",
    description: "Neighbor or third party occupying or encroaching on your land",
    keyQuestions: [
      "When did the encroachment start — approximately which year?",
      "Have you had a survey done to confirm the boundary?",
      "Has the encroacher built any structure on your land?",
      "Do you have the original property documents?"
    ]
  },
  {
    id: "RENT_TENANCY",
    label: "Rent / Tenancy Dispute",
    description: "Eviction, rent arrears, illegal occupation by tenant",
    keyQuestions: [
      "Is the property residential or commercial?",
      "Do you have a registered rent agreement?",
      "How many months of rent are unpaid, if any?",
      "Have you already sent any notice to the tenant?"
    ]
  },
  {
    id: "FAMILY_SUCCESSION",
    label: "Family / Succession Matter",
    description: "Inheritance disputes, will contests, legal heir certificates",
    keyQuestions: [
      "Who passed away and approximately when?",
      "Was there a will? Has it been probated?",
      "Who are the legal heirs and is there a dispute among them?",
      "What assets are involved — property, bank accounts, or both?"
    ]
  },
  {
    id: "CIVIL_CONTRACT",
    label: "Civil / Contract Dispute",
    description: "Breach of agreement, money recovery, business disputes",
    keyQuestions: [
      "Is there a written and signed agreement between the parties?",
      "What exactly was the breach — non-payment, non-performance, or both?",
      "What is the approximate amount or value in dispute?",
      "When did the breach occur?"
    ]
  },
  {
    id: "CIVIL_INJUNCTION",
    label: "Injunction / Stay Order",
    description: "Urgent court order to stop someone from doing something",
    keyQuestions: [
      "What specific action do you want to stop?",
      "Is this action ongoing right now or is it about to happen?",
      "What harm will occur if the action is not stopped immediately?",
      "Have you tried any other resolution — notice, negotiation?"
    ]
  },
  {
    id: "RERA_BUILDER",
    label: "RERA / Builder Dispute",
    description: "Builder delay, defects, cancellation, refund from developer",
    keyQuestions: [
      "Is the project registered under Karnataka RERA?",
      "What is the date of your sale agreement with the builder?",
      "Is the issue a delay in possession, construction defect, or refund?",
      "Have you sent any written complaint to the builder?"
    ]
  },
  {
    id: "CHEQUE_BOUNCE",
    label: "Cheque Bounce (NI Act)",
    description: "Dishonoured cheque, Section 138 Negotiable Instruments Act",
    keyQuestions: [
      "What was the cheque amount and date?",
      "Do you have the bank return memo showing the cheque bounced?",
      "Have you already sent a legal demand notice within 30 days of the return memo?",
      "What was the cheque given for — loan, payment, security?"
    ]
  },
  {
    id: "DOCUMENTATION",
    label: "Documentation / Drafting Service",
    description: "Drafting agreements, affidavits, legal notices, sale deeds",
    keyQuestions: [
      "What type of document do you need — agreement, notice, affidavit, or deed?",
      "What is the purpose of the document?",
      "What are the names and details of the parties involved?",
      "Is there a deadline or urgency for this document?"
    ]
  }
];
