/**
 * Denuel AI - Prompt Template Seed Data
 * Global default templates for all departments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Department = 'ADMIN' | 'SALES' | 'AGENT' | 'ACCOUNTANT' | 'HR' | 'DESIGN' | 'ZR' | 'GENERAL';

interface TemplateData {
  department: Department;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  category: string;
  icon: string;
}

// =====================================================
// ADMIN TEMPLATES (10)
// =====================================================
const adminTemplates: TemplateData[] = [
  {
    department: 'ADMIN',
    name: 'Weekly Business Summary',
    description: 'Generate a comprehensive weekly business performance summary',
    systemPrompt: 'You are a business analyst for a car dealership. Provide clear, actionable insights in a professional tone. Focus on key metrics, trends, and recommendations.',
    userPromptTemplate: `Generate a weekly business summary for {tenantName} covering:
- Total leads received: {totalLeads}
- Leads converted: {convertedLeads}
- Cars sold: {carsSold}
- Revenue: {revenue} {currency}
- Top performing cars: {topCars}
- Staff highlights: {staffHighlights}

Provide insights and recommendations for improvement.`,
    variables: ['tenantName', 'totalLeads', 'convertedLeads', 'carsSold', 'revenue', 'currency', 'topCars', 'staffHighlights'],
    category: 'reports',
    icon: 'BarChart3'
  },
  {
    department: 'ADMIN',
    name: 'Tenant Growth Insights',
    description: 'Analyze tenant growth patterns and suggest optimization strategies',
    systemPrompt: 'You are a SaaS growth strategist. Analyze dealership performance data and provide actionable growth recommendations.',
    userPromptTemplate: `Analyze growth for {tenantName}:
- Current plan: {currentPlan}
- Cars listed: {carsListed} / {carLimit}
- Monthly leads: {monthlyLeads}
- Conversion rate: {conversionRate}%
- Active staff: {activeStaff}

Suggest strategies to improve growth and optimize their subscription.`,
    variables: ['tenantName', 'currentPlan', 'carsListed', 'carLimit', 'monthlyLeads', 'conversionRate', 'activeStaff'],
    category: 'insights',
    icon: 'TrendingUp'
  },
  {
    department: 'ADMIN',
    name: 'Upgrade Suggestions',
    description: 'Generate personalized upgrade recommendations based on usage',
    systemPrompt: 'You are a customer success manager. Provide helpful, non-pushy upgrade suggestions based on actual usage data.',
    userPromptTemplate: `Based on {tenantName}'s usage:
- Current plan: {currentPlan}
- Cars: {carsUsed}/{carLimit} ({carUsagePercent}%)
- Staff: {staffUsed}/{staffLimit}
- AI requests: {aiUsed}/{aiLimit}
- Features used: {featuresUsed}
- Features not using: {featuresUnused}

Suggest whether they should upgrade, which plan suits them, and highlight benefits they'd unlock.`,
    variables: ['tenantName', 'currentPlan', 'carsUsed', 'carLimit', 'carUsagePercent', 'staffUsed', 'staffLimit', 'aiUsed', 'aiLimit', 'featuresUsed', 'featuresUnused'],
    category: 'recommendations',
    icon: 'Sparkles'
  },
  {
    department: 'ADMIN',
    name: 'Top Performing Cars',
    description: 'Identify and analyze best-selling inventory',
    systemPrompt: 'You are an automotive market analyst. Analyze sales data and identify patterns in successful inventory.',
    userPromptTemplate: `Analyze top performing cars for {tenantName}:
{topCarsData}

Identify:
1. What makes these cars sell fast
2. Price patterns that work
3. Recommended similar stock to acquire
4. Marketing angles for these vehicles`,
    variables: ['tenantName', 'topCarsData'],
    category: 'analysis',
    icon: 'Trophy'
  },
  {
    department: 'ADMIN',
    name: 'Underperforming Inventory',
    description: 'Identify slow-moving stock and suggest action plans',
    systemPrompt: 'You are an inventory optimization specialist. Help dealerships move slow stock without heavy discounting.',
    userPromptTemplate: `Analyze underperforming inventory for {tenantName}:
{slowStockData}

For each vehicle suggest:
1. Why it might not be selling
2. Price adjustment recommendations
3. Marketing improvements
4. Alternative sales channels
5. When to consider wholesaling`,
    variables: ['tenantName', 'slowStockData'],
    category: 'analysis',
    icon: 'AlertTriangle'
  },
  {
    department: 'ADMIN',
    name: 'Lead Conversion Insights',
    description: 'Analyze lead-to-sale conversion funnel',
    systemPrompt: 'You are a sales funnel optimization expert. Analyze conversion data and identify improvement opportunities.',
    userPromptTemplate: `Analyze lead conversion for {tenantName}:
- Total leads: {totalLeads}
- Contacted: {contactedLeads} ({contactRate}%)
- Qualified: {qualifiedLeads} ({qualifyRate}%)
- Converted: {convertedLeads} ({conversionRate}%)
- Average time to convert: {avgConversionDays} days
- Top lead sources: {leadSources}

Identify bottlenecks and suggest improvements.`,
    variables: ['tenantName', 'totalLeads', 'contactedLeads', 'contactRate', 'qualifiedLeads', 'qualifyRate', 'convertedLeads', 'conversionRate', 'avgConversionDays', 'leadSources'],
    category: 'insights',
    icon: 'Funnel'
  },
  {
    department: 'ADMIN',
    name: 'Staff Performance Summary',
    description: 'Generate staff performance overview with recommendations',
    systemPrompt: 'You are an HR performance analyst. Provide balanced, constructive feedback on team performance.',
    userPromptTemplate: `Generate staff performance summary for {tenantName}:
{staffPerformanceData}

Include:
1. Top performers and why
2. Areas needing support
3. Team collaboration insights
4. Training recommendations
5. Recognition suggestions`,
    variables: ['tenantName', 'staffPerformanceData'],
    category: 'reports',
    icon: 'Users'
  },
  {
    department: 'ADMIN',
    name: 'Risk & Fraud Signals',
    description: 'Identify potential risk patterns (non-destructive analysis)',
    systemPrompt: 'You are a risk analyst. Identify potential issues without making accusations. Flag for human review only.',
    userPromptTemplate: `Review activity for potential risks at {tenantName}:
{activityData}

Flag any unusual patterns:
1. Payment anomalies
2. Unusual access patterns
3. Data inconsistencies
4. Process deviations

Note: These are signals for human review, not accusations.`,
    variables: ['tenantName', 'activityData'],
    category: 'security',
    icon: 'Shield'
  },
  {
    department: 'ADMIN',
    name: 'System Health Checklist',
    description: 'Generate system health and optimization checklist',
    systemPrompt: 'You are a system administrator. Provide a clear checklist for maintaining dealership system health.',
    userPromptTemplate: `Generate system health checklist for {tenantName}:
- Data completeness: {dataCompleteness}%
- Cars with images: {carsWithImages}%
- Updated pricing: {updatedPricing}%
- Active integrations: {integrations}
- Last backup: {lastBackup}

Provide prioritized action items.`,
    variables: ['tenantName', 'dataCompleteness', 'carsWithImages', 'updatedPricing', 'integrations', 'lastBackup'],
    category: 'maintenance',
    icon: 'CheckCircle'
  },
  {
    department: 'ADMIN',
    name: 'Action Plan for This Week',
    description: 'Generate prioritized weekly action plan',
    systemPrompt: 'You are a business operations manager. Create actionable, realistic weekly plans.',
    userPromptTemplate: `Create this week's action plan for {tenantName}:
- Pending tasks: {pendingTasks}
- Overdue items: {overdueItems}
- Upcoming deadlines: {upcomingDeadlines}
- Team availability: {teamAvailability}
- Priority goals: {priorityGoals}

Create a day-by-day action plan with clear owners and deadlines.`,
    variables: ['tenantName', 'pendingTasks', 'overdueItems', 'upcomingDeadlines', 'teamAvailability', 'priorityGoals'],
    category: 'planning',
    icon: 'Calendar'
  }
];

// =====================================================
// SALES TEMPLATES (10)
// =====================================================
const salesTemplates: TemplateData[] = [
  {
    department: 'SALES',
    name: 'Reply to Inquiry',
    description: 'Professional and persuasive response to customer inquiry',
    systemPrompt: 'You are a professional car sales consultant. Be helpful, knowledgeable, and persuasive without being pushy. Use a friendly, Zambian-appropriate tone.',
    userPromptTemplate: `Write a professional reply to this customer inquiry:

Customer: {customerName}
Inquiry about: {carTitle} (Stock #{stockNo})
Their message: {customerMessage}
Car details: {carDetails}
Price: {price} {currency}

Include: greeting, address their questions, highlight key benefits, suggest next steps (viewing/test drive), and a call-to-action.`,
    variables: ['customerName', 'carTitle', 'stockNo', 'customerMessage', 'carDetails', 'price', 'currency'],
    category: 'replies',
    icon: 'MessageSquare'
  },
  {
    department: 'SALES',
    name: 'WhatsApp Quick Reply',
    description: 'Short, friendly WhatsApp response',
    systemPrompt: 'Write short, friendly WhatsApp messages. Use appropriate emojis sparingly. Be concise but warm.',
    userPromptTemplate: `Write a short WhatsApp reply:
Customer: {customerName}
Asked about: {carTitle}
Their message: {customerMessage}

Keep it under 100 words. Be friendly and include a clear next step.`,
    variables: ['customerName', 'carTitle', 'customerMessage'],
    category: 'replies',
    icon: 'MessageCircle'
  },
  {
    department: 'SALES',
    name: 'Follow-up After 24h',
    description: 'Follow-up message for leads not responding',
    systemPrompt: 'Write polite follow-up messages. Don\'t be pushy. Show genuine interest in helping.',
    userPromptTemplate: `Write a follow-up message for:
Customer: {customerName}
Car interested in: {carTitle} ({stockNo})
Last contact: {lastContactDate}
Previous discussion: {previousNotes}

Create a warm follow-up that adds value (new info, special offer, or helpful suggestion).`,
    variables: ['customerName', 'carTitle', 'stockNo', 'lastContactDate', 'previousNotes'],
    category: 'follow-ups',
    icon: 'Clock'
  },
  {
    department: 'SALES',
    name: 'Quote Explanation',
    description: 'Explain pricing breakdown clearly',
    systemPrompt: 'Explain car pricing clearly. Be transparent about all costs. Build trust through clarity.',
    userPromptTemplate: `Explain this quote to the customer:
Customer: {customerName}
Car: {carTitle}
Base Price: {basePrice} {currency}
Deposit Required: {deposit} {currency}
Balance: {balance} {currency}
Delivery: {deliveryInfo}
Additional costs: {additionalCosts}

Explain each component clearly, payment options, and next steps.`,
    variables: ['customerName', 'carTitle', 'basePrice', 'currency', 'deposit', 'balance', 'deliveryInfo', 'additionalCosts'],
    category: 'quotes',
    icon: 'Receipt'
  },
  {
    department: 'SALES',
    name: 'Objection Handling',
    description: 'Respond to common customer objections',
    systemPrompt: 'Handle objections professionally. Acknowledge concerns, provide solutions, never dismiss. Build trust.',
    userPromptTemplate: `Customer objection:
Customer: {customerName}
Car: {carTitle}
Objection type: {objectionType}
Their concern: {customerConcern}

Provide a thoughtful response that:
1. Acknowledges their concern
2. Provides relevant information
3. Offers solutions or alternatives
4. Maintains trust`,
    variables: ['customerName', 'carTitle', 'objectionType', 'customerConcern'],
    category: 'objections',
    icon: 'HelpCircle'
  },
  {
    department: 'SALES',
    name: 'Recommend Similar Cars',
    description: 'Suggest alternative vehicles based on preferences',
    systemPrompt: 'Recommend cars based on customer needs. Explain why each recommendation fits. Be helpful, not salesy.',
    userPromptTemplate: `Customer looking for alternatives:
Customer: {customerName}
Original interest: {originalCar}
Budget: {budget} {currency}
Requirements: {requirements}
Available alternatives: {alternativeCars}

Recommend 2-3 alternatives with clear reasons why each might suit them.`,
    variables: ['customerName', 'originalCar', 'budget', 'currency', 'requirements', 'alternativeCars'],
    category: 'recommendations',
    icon: 'Car'
  },
  {
    department: 'SALES',
    name: 'Deal Summary Notes',
    description: 'Create internal notes summarizing a deal',
    systemPrompt: 'Create clear, professional internal deal summaries. Include all relevant details for team handoff.',
    userPromptTemplate: `Create deal summary notes:
Customer: {customerName}
Car: {carTitle} ({stockNo})
Price agreed: {agreedPrice} {currency}
Deposit status: {depositStatus}
Payment plan: {paymentPlan}
Delivery: {deliveryDetails}
Special requests: {specialRequests}
Next steps: {nextSteps}

Format as structured internal notes.`,
    variables: ['customerName', 'carTitle', 'stockNo', 'agreedPrice', 'currency', 'depositStatus', 'paymentPlan', 'deliveryDetails', 'specialRequests', 'nextSteps'],
    category: 'notes',
    icon: 'FileText'
  },
  {
    department: 'SALES',
    name: 'Convert to Appointment',
    description: 'Message to convert inquiry into showroom visit',
    systemPrompt: 'Craft compelling messages that encourage showroom visits. Make it easy to say yes.',
    userPromptTemplate: `Convert this lead to an appointment:
Customer: {customerName}
Interest: {carTitle}
Location: {branch}
Available times: {availableTimes}
Incentive: {incentive}

Write a message inviting them to visit, highlighting what they'll experience.`,
    variables: ['customerName', 'carTitle', 'branch', 'availableTimes', 'incentive'],
    category: 'appointments',
    icon: 'CalendarCheck'
  },
  {
    department: 'SALES',
    name: 'Negotiation Message',
    description: 'Professional negotiation response',
    systemPrompt: 'Handle price negotiations professionally. Be firm but flexible. Focus on value, not just price.',
    userPromptTemplate: `Create a negotiation response:
Customer: {customerName}
Car: {carTitle}
Listed price: {listedPrice} {currency}
Customer offer: {customerOffer} {currency}
Our bottom line: {bottomLine} {currency}
Car advantages: {carAdvantages}

Write a response that bridges the gap while maintaining value.`,
    variables: ['customerName', 'carTitle', 'listedPrice', 'currency', 'customerOffer', 'bottomLine', 'carAdvantages'],
    category: 'negotiation',
    icon: 'Handshake'
  },
  {
    department: 'SALES',
    name: 'Invoice Note',
    description: 'Customer-friendly invoice/receipt note',
    systemPrompt: 'Write clear, professional invoice notes. Be warm but professional.',
    userPromptTemplate: `Create a customer-friendly note for invoice:
Customer: {customerName}
Car: {carTitle}
Amount: {amount} {currency}
Payment type: {paymentType}
Balance remaining: {balance}
Next due date: {dueDate}

Write a thank you note with clear payment information.`,
    variables: ['customerName', 'carTitle', 'amount', 'currency', 'paymentType', 'balance', 'dueDate'],
    category: 'invoices',
    icon: 'CreditCard'
  }
];

// =====================================================
// AGENT TEMPLATES (10)
// =====================================================
const agentTemplates: TemplateData[] = [
  {
    department: 'AGENT',
    name: 'Prioritize Today\'s Leads',
    description: 'AI-powered lead prioritization for the day',
    systemPrompt: 'Help agents prioritize leads based on potential and urgency. Be practical and action-oriented.',
    userPromptTemplate: `Prioritize these leads for today:
{leadsList}

Consider:
- Lead score/quality
- Time since last contact
- Customer intent signals
- Deal value potential

Provide ranked list with suggested approach for each.`,
    variables: ['leadsList'],
    category: 'planning',
    icon: 'ListOrdered'
  },
  {
    department: 'AGENT',
    name: 'Visit Summary',
    description: 'Generate summary after customer visit',
    systemPrompt: 'Create professional visit summaries. Capture key details for follow-up.',
    userPromptTemplate: `Create visit summary:
Customer: {customerName}
Date: {visitDate}
Cars viewed: {carsViewed}
Discussion points: {discussionPoints}
Customer feedback: {customerFeedback}
Agreed next steps: {nextSteps}

Format as structured notes with action items.`,
    variables: ['customerName', 'visitDate', 'carsViewed', 'discussionPoints', 'customerFeedback', 'nextSteps'],
    category: 'notes',
    icon: 'ClipboardList'
  },
  {
    department: 'AGENT',
    name: 'Customer Notes Cleanup',
    description: 'Organize and summarize scattered customer notes',
    systemPrompt: 'Consolidate messy notes into clear, organized summaries. Preserve important details.',
    userPromptTemplate: `Clean up and organize these customer notes:
Customer: {customerName}
Raw notes: {rawNotes}

Create organized summary with:
- Key preferences
- Budget/financing needs
- Timeline
- Important personal details
- Concerns/objections raised
- Next actions`,
    variables: ['customerName', 'rawNotes'],
    category: 'notes',
    icon: 'FileEdit'
  },
  {
    department: 'AGENT',
    name: 'Suggested Next Steps',
    description: 'AI suggestions for advancing each lead',
    systemPrompt: 'Provide practical, actionable next steps based on lead status. Be specific.',
    userPromptTemplate: `Suggest next steps for this lead:
Customer: {customerName}
Status: {leadStatus}
Last action: {lastAction}
Days since contact: {daysSinceContact}
Interest level: {interestLevel}
Previous interactions: {interactionHistory}

Suggest 2-3 specific next actions with timing.`,
    variables: ['customerName', 'leadStatus', 'lastAction', 'daysSinceContact', 'interestLevel', 'interactionHistory'],
    category: 'recommendations',
    icon: 'ArrowRight'
  },
  {
    department: 'AGENT',
    name: 'Short Pitch Script',
    description: 'Personalized pitch script for customer',
    systemPrompt: 'Create natural, conversational pitch scripts. Not robotic. Personalized to customer.',
    userPromptTemplate: `Create a short pitch script for:
Customer: {customerName}
Their needs: {customerNeeds}
Car to pitch: {carTitle}
Key selling points: {sellingPoints}
Their concerns: {concerns}

Create a natural 30-second pitch addressing their specific needs.`,
    variables: ['customerName', 'customerNeeds', 'carTitle', 'sellingPoints', 'concerns'],
    category: 'scripts',
    icon: 'Mic'
  },
  {
    department: 'AGENT',
    name: 'WhatsApp Broadcast',
    description: 'Message for broadcasting to multiple leads',
    systemPrompt: 'Create broadcast messages that feel personal. Include personalization tokens.',
    userPromptTemplate: `Create WhatsApp broadcast message:
Topic: {broadcastTopic}
Target audience: {audienceType}
Key offer: {keyOffer}
Call to action: {callToAction}

Create a message that feels personal, not spammy. Include {name} placeholder.`,
    variables: ['broadcastTopic', 'audienceType', 'keyOffer', 'callToAction'],
    category: 'marketing',
    icon: 'Send'
  },
  {
    department: 'AGENT',
    name: 'Lead Reactivation',
    description: 'Re-engage cold leads',
    systemPrompt: 'Create warm, non-pushy reactivation messages. Give a reason to re-engage.',
    userPromptTemplate: `Create reactivation message for cold lead:
Customer: {customerName}
Last contact: {lastContact}
Previous interest: {previousInterest}
What's new: {whatsNew}

Write a warm message that gives them a reason to reconnect.`,
    variables: ['customerName', 'lastContact', 'previousInterest', 'whatsNew'],
    category: 'follow-ups',
    icon: 'RefreshCw'
  },
  {
    department: 'AGENT',
    name: 'Route Plan',
    description: 'Optimize daily visit route (placeholder)',
    systemPrompt: 'Help organize customer visits efficiently.',
    userPromptTemplate: `Plan visit route for:
Visits scheduled: {visitsList}
Starting point: {startLocation}
Time available: {timeAvailable}

Suggest optimal order considering location and priority.`,
    variables: ['visitsList', 'startLocation', 'timeAvailable'],
    category: 'planning',
    icon: 'Map'
  },
  {
    department: 'AGENT',
    name: 'Key Details Checklist',
    description: 'Checklist for capturing customer information',
    systemPrompt: 'Create practical checklists for field agents.',
    userPromptTemplate: `Create a details capture checklist for:
Customer type: {customerType}
Purpose: {visitPurpose}
Car interest: {carInterest}

Generate checklist of key information to capture during the visit.`,
    variables: ['customerType', 'visitPurpose', 'carInterest'],
    category: 'checklists',
    icon: 'CheckSquare'
  },
  {
    department: 'AGENT',
    name: 'Post-Visit Follow-up',
    description: 'Thank you message after customer visit',
    systemPrompt: 'Write warm, personal follow-up messages after visits.',
    userPromptTemplate: `Create post-visit follow-up:
Customer: {customerName}
Visit date: {visitDate}
Cars discussed: {carsDiscussed}
Agreed actions: {agreedActions}
Special notes: {specialNotes}

Write a thank you message referencing the visit and next steps.`,
    variables: ['customerName', 'visitDate', 'carsDiscussed', 'agreedActions', 'specialNotes'],
    category: 'follow-ups',
    icon: 'Heart'
  }
];

// =====================================================
// ACCOUNTANT TEMPLATES (10)
// =====================================================
const accountantTemplates: TemplateData[] = [
  {
    department: 'ACCOUNTANT',
    name: 'Monthly Finance Summary',
    description: 'Generate monthly financial overview',
    systemPrompt: 'Create clear financial summaries. Be accurate and highlight key metrics.',
    userPromptTemplate: `Generate monthly finance summary for {tenantName}:
Period: {month} {year}
Revenue: {revenue} {currency}
Collections: {collections} {currency}
Outstanding: {outstanding} {currency}
Expenses: {expenses} {currency}
Top revenue sources: {topSources}

Provide summary with key insights and recommendations.`,
    variables: ['tenantName', 'month', 'year', 'revenue', 'collections', 'outstanding', 'expenses', 'currency', 'topSources'],
    category: 'reports',
    icon: 'DollarSign'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Overdue Installments',
    description: 'Explain overdue payment situations',
    systemPrompt: 'Explain payment situations clearly. Be professional and solution-focused.',
    userPromptTemplate: `Explain overdue installments:
{overdueList}

For each, suggest:
- Appropriate follow-up action
- Message tone recommendation
- Escalation threshold`,
    variables: ['overdueList'],
    category: 'collections',
    icon: 'AlertCircle'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Payment Reconciliation',
    description: 'Help reconcile payments with hints',
    systemPrompt: 'Help identify potential payment matches and discrepancies.',
    userPromptTemplate: `Help reconcile these payments:
Unmatched payments: {unmatchedPayments}
Open invoices: {openInvoices}

Suggest likely matches and flag discrepancies for review.`,
    variables: ['unmatchedPayments', 'openInvoices'],
    category: 'reconciliation',
    icon: 'GitMerge'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Receipt/Invoice Wording',
    description: 'Generate professional receipt text',
    systemPrompt: 'Create clear, professional financial document wording.',
    userPromptTemplate: `Generate receipt/invoice wording:
Type: {documentType}
Customer: {customerName}
Items: {items}
Total: {total} {currency}
Payment method: {paymentMethod}
Notes: {notes}`,
    variables: ['documentType', 'customerName', 'items', 'total', 'currency', 'paymentMethod', 'notes'],
    category: 'documents',
    icon: 'FileText'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Tax Summary Placeholder',
    description: 'VAT/tax calculation notes (placeholder)',
    systemPrompt: 'Provide general tax-related summaries. Remind to consult tax professionals.',
    userPromptTemplate: `Generate tax summary notes:
Period: {period}
Revenue: {revenue} {currency}
VAT collected: {vatCollected}
Deductible: {deductible}

Note: This is a summary only. Consult your tax advisor for compliance.`,
    variables: ['period', 'revenue', 'currency', 'vatCollected', 'deductible'],
    category: 'tax',
    icon: 'Calculator'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Inconsistency Flags',
    description: 'Explain flagged financial inconsistencies',
    systemPrompt: 'Explain financial discrepancies clearly. These are flags for review, not accusations.',
    userPromptTemplate: `Explain these flagged inconsistencies:
{inconsistencies}

For each:
- Explain what was flagged
- Possible legitimate reasons
- Recommended verification steps`,
    variables: ['inconsistencies'],
    category: 'audit',
    icon: 'Flag'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Cashflow Snapshot',
    description: 'Quick cashflow status overview',
    systemPrompt: 'Provide clear cashflow summaries with actionable insights.',
    userPromptTemplate: `Generate cashflow snapshot:
Current balance: {currentBalance} {currency}
Expected inflows: {expectedInflows}
Upcoming expenses: {upcomingExpenses}
Projected balance: {projectedBalance}

Highlight any concerns or recommendations.`,
    variables: ['currentBalance', 'currency', 'expectedInflows', 'upcomingExpenses', 'projectedBalance'],
    category: 'reports',
    icon: 'Activity'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Budget Suggestions',
    description: 'AI-powered budget recommendations',
    systemPrompt: 'Provide practical budget recommendations based on spending patterns.',
    userPromptTemplate: `Suggest budget optimizations:
Current spending: {currentSpending}
Revenue: {revenue} {currency}
Historical patterns: {historicalPatterns}
Goals: {goals}

Suggest budget allocations and savings opportunities.`,
    variables: ['currentSpending', 'revenue', 'currency', 'historicalPatterns', 'goals'],
    category: 'planning',
    icon: 'PiggyBank'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Explain to Non-Accountant',
    description: 'Translate financial data into simple terms',
    systemPrompt: 'Explain financial concepts in simple, non-technical language.',
    userPromptTemplate: `Explain this financial data in simple terms:
{financialData}

Target audience: {audience}

Use simple language, avoid jargon, include helpful analogies.`,
    variables: ['financialData', 'audience'],
    category: 'communication',
    icon: 'MessageCircle'
  },
  {
    department: 'ACCOUNTANT',
    name: 'Payment Reminder',
    description: 'Professional payment reminder messages',
    systemPrompt: 'Write professional but firm payment reminders. Maintain good relationships.',
    userPromptTemplate: `Create payment reminder:
Customer: {customerName}
Amount due: {amountDue} {currency}
Days overdue: {daysOverdue}
Previous reminders: {previousReminders}
Relationship: {relationshipNotes}

Tone: {tone}`,
    variables: ['customerName', 'amountDue', 'currency', 'daysOverdue', 'previousReminders', 'relationshipNotes', 'tone'],
    category: 'collections',
    icon: 'Bell'
  }
];

// =====================================================
// HR TEMPLATES (10)
// =====================================================
const hrTemplates: TemplateData[] = [
  {
    department: 'HR',
    name: 'Staff Performance Summary',
    description: 'Individual or team performance overview',
    systemPrompt: 'Create balanced, constructive performance summaries. Be fair and development-focused.',
    userPromptTemplate: `Generate performance summary:
Staff: {staffName}
Role: {role}
Period: {period}
Key metrics: {metrics}
Achievements: {achievements}
Areas for improvement: {improvements}
Feedback received: {feedback}

Create balanced summary with actionable recommendations.`,
    variables: ['staffName', 'role', 'period', 'metrics', 'achievements', 'improvements', 'feedback'],
    category: 'performance',
    icon: 'UserCheck'
  },
  {
    department: 'HR',
    name: 'Leave Request Response',
    description: 'Draft leave approval/denial response',
    systemPrompt: 'Write professional leave responses. Be clear about decisions and next steps.',
    userPromptTemplate: `Draft leave response:
Staff: {staffName}
Request type: {leaveType}
Dates: {dates}
Decision: {decision}
Reason for decision: {reason}
Coverage plan: {coverage}

Write professional response.`,
    variables: ['staffName', 'leaveType', 'dates', 'decision', 'reason', 'coverage'],
    category: 'leave',
    icon: 'Calendar'
  },
  {
    department: 'HR',
    name: 'Role Recommendation',
    description: 'Suggest best-fit roles for staff',
    systemPrompt: 'Recommend roles based on skills and performance. Be objective and development-focused.',
    userPromptTemplate: `Recommend roles for:
Staff: {staffName}
Current role: {currentRole}
Skills: {skills}
Performance history: {performance}
Career interests: {interests}
Available positions: {availablePositions}

Suggest suitable roles with rationale.`,
    variables: ['staffName', 'currentRole', 'skills', 'performance', 'interests', 'availablePositions'],
    category: 'development',
    icon: 'Target'
  },
  {
    department: 'HR',
    name: 'Onboarding Checklist',
    description: 'Generate new hire onboarding checklist',
    systemPrompt: 'Create comprehensive onboarding checklists tailored to the role.',
    userPromptTemplate: `Create onboarding checklist:
New hire: {staffName}
Role: {role}
Department: {department}
Start date: {startDate}
Manager: {manager}
Special requirements: {requirements}

Generate week-by-week onboarding plan.`,
    variables: ['staffName', 'role', 'department', 'startDate', 'manager', 'requirements'],
    category: 'onboarding',
    icon: 'UserPlus'
  },
  {
    department: 'HR',
    name: 'Disciplinary Warning',
    description: 'Draft professional warning letter',
    systemPrompt: 'Write fair, professional disciplinary communications. Be clear about issues and expectations.',
    userPromptTemplate: `Draft disciplinary warning:
Staff: {staffName}
Issue: {issue}
Previous warnings: {previousWarnings}
Evidence: {evidence}
Expected improvement: {expectedImprovement}
Consequence if not improved: {consequences}

Create professional, fair warning.`,
    variables: ['staffName', 'issue', 'previousWarnings', 'evidence', 'expectedImprovement', 'consequences'],
    category: 'disciplinary',
    icon: 'AlertTriangle'
  },
  {
    department: 'HR',
    name: 'Training Plan',
    description: 'Suggest training plan for staff',
    systemPrompt: 'Create practical, relevant training recommendations.',
    userPromptTemplate: `Create training plan:
Staff: {staffName}
Current skills: {currentSkills}
Skill gaps: {skillGaps}
Career goals: {careerGoals}
Available training: {availableTraining}
Budget: {budget}

Suggest prioritized training plan.`,
    variables: ['staffName', 'currentSkills', 'skillGaps', 'careerGoals', 'availableTraining', 'budget'],
    category: 'training',
    icon: 'GraduationCap'
  },
  {
    department: 'HR',
    name: 'Attendance Summary',
    description: 'Shift/attendance pattern analysis',
    systemPrompt: 'Summarize attendance data objectively. Identify patterns without assumptions.',
    userPromptTemplate: `Summarize attendance:
Staff: {staffName}
Period: {period}
Days worked: {daysWorked}
Late arrivals: {lateArrivals}
Absences: {absences}
Overtime: {overtime}
Patterns: {patterns}

Create objective summary with observations.`,
    variables: ['staffName', 'period', 'daysWorked', 'lateArrivals', 'absences', 'overtime', 'patterns'],
    category: 'attendance',
    icon: 'Clock'
  },
  {
    department: 'HR',
    name: 'Conflict Mediation Note',
    description: 'Draft neutral conflict mediation notes',
    systemPrompt: 'Write neutral, fair mediation notes. Focus on resolution, not blame.',
    userPromptTemplate: `Draft mediation notes:
Parties involved: {parties}
Issue summary: {issueSummary}
Each party's perspective: {perspectives}
Agreed resolution: {resolution}
Follow-up actions: {followUp}

Create neutral documentation.`,
    variables: ['parties', 'issueSummary', 'perspectives', 'resolution', 'followUp'],
    category: 'relations',
    icon: 'Scale'
  },
  {
    department: 'HR',
    name: 'Contract Summary',
    description: 'Summarize employment contract (non-legal)',
    systemPrompt: 'Summarize contracts in plain language. Note: This is not legal advice.',
    userPromptTemplate: `Summarize contract terms:
Staff: {staffName}
Contract type: {contractType}
Key terms: {keyTerms}
Benefits: {benefits}
Obligations: {obligations}
Duration: {duration}

Create plain-language summary. Note: Not legal advice.`,
    variables: ['staffName', 'contractType', 'keyTerms', 'benefits', 'obligations', 'duration'],
    category: 'contracts',
    icon: 'FileText'
  },
  {
    department: 'HR',
    name: 'HR Monthly Report',
    description: 'Generate monthly HR metrics report',
    systemPrompt: 'Create comprehensive HR reports with actionable insights.',
    userPromptTemplate: `Generate HR monthly report:
Period: {period}
Headcount: {headcount}
New hires: {newHires}
Departures: {departures}
Attendance rate: {attendanceRate}
Training hours: {trainingHours}
Open positions: {openPositions}
Key issues: {keyIssues}

Create executive summary with recommendations.`,
    variables: ['period', 'headcount', 'newHires', 'departures', 'attendanceRate', 'trainingHours', 'openPositions', 'keyIssues'],
    category: 'reports',
    icon: 'BarChart'
  }
];

// =====================================================
// DESIGN TEMPLATES (10)
// =====================================================
const designTemplates: TemplateData[] = [
  {
    department: 'DESIGN',
    name: 'Banner Headlines',
    description: 'Generate banner headline options',
    systemPrompt: 'Create catchy, action-oriented headlines for car dealership marketing. Short and impactful.',
    userPromptTemplate: `Generate banner headlines:
Campaign: {campaignName}
Target audience: {audience}
Key message: {keyMessage}
Tone: {tone}
Character limit: {charLimit}

Generate 5 headline options with variations.`,
    variables: ['campaignName', 'audience', 'keyMessage', 'tone', 'charLimit'],
    category: 'copy',
    icon: 'Type'
  },
  {
    department: 'DESIGN',
    name: 'Promo Caption',
    description: 'Generate promotional captions',
    systemPrompt: 'Write engaging social media captions. Include relevant hashtags. Match brand voice.',
    userPromptTemplate: `Generate promo caption:
Promotion: {promotionDetails}
Platform: {platform}
Call to action: {cta}
Hashtag style: {hashtagStyle}
Brand voice: {brandVoice}

Generate 3 caption options.`,
    variables: ['promotionDetails', 'platform', 'cta', 'hashtagStyle', 'brandVoice'],
    category: 'social',
    icon: 'Hash'
  },
  {
    department: 'DESIGN',
    name: 'SEO Car Title',
    description: 'Generate SEO-optimized car listing titles',
    systemPrompt: 'Create SEO-friendly car titles. Include key specs. Balance keywords with readability.',
    userPromptTemplate: `Generate SEO car title:
Make: {make}
Model: {model}
Year: {year}
Key specs: {specs}
Selling points: {sellingPoints}
Target keywords: {keywords}

Generate 3 SEO-optimized titles.`,
    variables: ['make', 'model', 'year', 'specs', 'sellingPoints', 'keywords'],
    category: 'seo',
    icon: 'Search'
  },
  {
    department: 'DESIGN',
    name: 'Social Post Copy',
    description: 'Generate Facebook/WhatsApp post copy',
    systemPrompt: 'Write engaging social posts. Platform-appropriate. Include engagement hooks.',
    userPromptTemplate: `Generate social post:
Platform: {platform}
Topic: {topic}
Car details: {carDetails}
Offer: {offer}
CTA: {cta}

Generate post copy with appropriate formatting.`,
    variables: ['platform', 'topic', 'carDetails', 'offer', 'cta'],
    category: 'social',
    icon: 'Share2'
  },
  {
    department: 'DESIGN',
    name: 'Watermark Text',
    description: 'Suggest watermark text options',
    systemPrompt: 'Suggest professional watermark text. Short and brandable.',
    userPromptTemplate: `Suggest watermark text:
Dealer name: {dealerName}
Style: {style}
Include: {includeElements}

Generate 5 watermark text options.`,
    variables: ['dealerName', 'style', 'includeElements'],
    category: 'branding',
    icon: 'Droplet'
  },
  {
    department: 'DESIGN',
    name: 'Image Order',
    description: 'Suggest optimal image ordering',
    systemPrompt: 'Recommend image ordering for maximum engagement. First impressions matter.',
    userPromptTemplate: `Suggest image order for:
Car: {carTitle}
Available shots: {availableShots}
Highlight features: {highlights}
Platform: {platform}

Suggest optimal order with reasoning.`,
    variables: ['carTitle', 'availableShots', 'highlights', 'platform'],
    category: 'optimization',
    icon: 'Image'
  },
  {
    department: 'DESIGN',
    name: 'Hero Message',
    description: 'Homepage hero section variants',
    systemPrompt: 'Create impactful hero section copy. Clear value proposition. Action-oriented.',
    userPromptTemplate: `Generate hero messages:
Dealer: {dealerName}
USP: {usp}
Target customer: {targetCustomer}
Current promotion: {promotion}
Tone: {tone}

Generate 3 hero headline + subtext combinations.`,
    variables: ['dealerName', 'usp', 'targetCustomer', 'promotion', 'tone'],
    category: 'web',
    icon: 'Layout'
  },
  {
    department: 'DESIGN',
    name: 'Brand Tone Guide',
    description: 'Generate brand voice guidelines',
    systemPrompt: 'Create practical brand voice guidelines. Include dos and don\'ts.',
    userPromptTemplate: `Generate brand tone guide:
Dealer: {dealerName}
Brand personality: {personality}
Target audience: {audience}
Competitor differentiation: {differentiation}
Examples to emulate: {examples}

Create concise brand voice guide.`,
    variables: ['dealerName', 'personality', 'audience', 'differentiation', 'examples'],
    category: 'branding',
    icon: 'Palette'
  },
  {
    department: 'DESIGN',
    name: 'Campaign Copy',
    description: 'Best deals/offer campaign copy',
    systemPrompt: 'Create compelling offer campaign copy. Urgency without being pushy. Clear value.',
    userPromptTemplate: `Generate campaign copy:
Campaign: {campaignName}
Offer details: {offerDetails}
Duration: {duration}
Target audience: {audience}
Channels: {channels}

Generate copy variants for each channel.`,
    variables: ['campaignName', 'offerDetails', 'duration', 'audience', 'channels'],
    category: 'campaigns',
    icon: 'Megaphone'
  },
  {
    department: 'DESIGN',
    name: 'Video Script',
    description: 'Short ad script for video',
    systemPrompt: 'Write concise video scripts. Attention-grabbing opening. Clear CTA.',
    userPromptTemplate: `Generate video script:
Duration: {duration} seconds
Purpose: {purpose}
Key message: {keyMessage}
Car featured: {carDetails}
CTA: {cta}

Create script with timing notes.`,
    variables: ['duration', 'purpose', 'keyMessage', 'carDetails', 'cta'],
    category: 'video',
    icon: 'Video'
  }
];

// =====================================================
// ZR/OPERATIONS TEMPLATES (10)
// =====================================================
const zrTemplates: TemplateData[] = [
  {
    department: 'ZR',
    name: 'Stock Status Update',
    description: 'Suggest stock status update messages',
    systemPrompt: 'Create clear, professional stock status updates.',
    userPromptTemplate: `Generate stock update:
Car: {carTitle} ({stockNo})
Current status: {currentStatus}
New status: {newStatus}
Reason: {reason}
ETA (if applicable): {eta}

Create internal and customer-facing versions.`,
    variables: ['carTitle', 'stockNo', 'currentStatus', 'newStatus', 'reason', 'eta'],
    category: 'updates',
    icon: 'Package'
  },
  {
    department: 'ZR',
    name: 'Delivery Checklist',
    description: 'Generate delivery/handover checklist',
    systemPrompt: 'Create comprehensive delivery checklists. Nothing should be missed.',
    userPromptTemplate: `Generate delivery checklist:
Car: {carTitle} ({stockNo})
Customer: {customerName}
Delivery type: {deliveryType}
Location: {location}
Special items: {specialItems}

Create detailed checklist.`,
    variables: ['carTitle', 'stockNo', 'customerName', 'deliveryType', 'location', 'specialItems'],
    category: 'checklists',
    icon: 'ClipboardCheck'
  },
  {
    department: 'ZR',
    name: 'Inspection Checklist',
    description: 'Vehicle inspection checklist',
    systemPrompt: 'Create thorough vehicle inspection checklists.',
    userPromptTemplate: `Generate inspection checklist:
Car: {carTitle} ({stockNo})
Inspection type: {inspectionType}
Focus areas: {focusAreas}
Previous issues: {previousIssues}

Create comprehensive checklist.`,
    variables: ['carTitle', 'stockNo', 'inspectionType', 'focusAreas', 'previousIssues'],
    category: 'checklists',
    icon: 'Search'
  },
  {
    department: 'ZR',
    name: 'Delay Root Cause',
    description: 'Analyze and explain delays',
    systemPrompt: 'Analyze delays objectively. Focus on resolution, not blame.',
    userPromptTemplate: `Analyze delay:
Car/Order: {reference}
Expected date: {expectedDate}
Actual status: {actualStatus}
Factors: {factors}

Provide root cause summary and prevention suggestions.`,
    variables: ['reference', 'expectedDate', 'actualStatus', 'factors'],
    category: 'analysis',
    icon: 'Clock'
  },
  {
    department: 'ZR',
    name: 'Route/Dispatch Note',
    description: 'Generate dispatch instructions',
    systemPrompt: 'Create clear dispatch notes with all necessary details.',
    userPromptTemplate: `Generate dispatch note:
Vehicle: {carTitle} ({stockNo})
From: {origin}
To: {destination}
Driver: {driver}
Special instructions: {instructions}
Timeline: {timeline}

Create dispatch documentation.`,
    variables: ['carTitle', 'stockNo', 'origin', 'destination', 'driver', 'instructions', 'timeline'],
    category: 'logistics',
    icon: 'Truck'
  },
  {
    department: 'ZR',
    name: 'Vehicle Movement Note',
    description: 'Document vehicle movements',
    systemPrompt: 'Create clear vehicle movement records.',
    userPromptTemplate: `Document vehicle movement:
Vehicle: {carTitle} ({stockNo})
Movement type: {movementType}
From: {fromLocation}
To: {toLocation}
Reason: {reason}
Authorized by: {authorizedBy}

Create movement record.`,
    variables: ['carTitle', 'stockNo', 'movementType', 'fromLocation', 'toLocation', 'reason', 'authorizedBy'],
    category: 'tracking',
    icon: 'ArrowRightLeft'
  },
  {
    department: 'ZR',
    name: 'Document Checklist',
    description: 'Document upload/verification checklist',
    systemPrompt: 'Create comprehensive document checklists based on vehicle type and transaction.',
    userPromptTemplate: `Generate document checklist:
Transaction type: {transactionType}
Vehicle: {carTitle}
Country: {country}
Special requirements: {specialRequirements}

Create required documents checklist.`,
    variables: ['transactionType', 'carTitle', 'country', 'specialRequirements'],
    category: 'checklists',
    icon: 'Files'
  },
  {
    department: 'ZR',
    name: 'Daily Operations Summary',
    description: 'End-of-day operations summary',
    systemPrompt: 'Create concise daily operations summaries.',
    userPromptTemplate: `Generate daily summary:
Date: {date}
Vehicles received: {received}
Vehicles dispatched: {dispatched}
Inspections completed: {inspections}
Pending actions: {pendingActions}
Issues flagged: {issues}

Create executive summary.`,
    variables: ['date', 'received', 'dispatched', 'inspections', 'pendingActions', 'issues'],
    category: 'reports',
    icon: 'FileText'
  },
  {
    department: 'ZR',
    name: 'Risk Flags',
    description: 'Flag operational risks',
    systemPrompt: 'Identify operational risks objectively. Flag for review, not conclusions.',
    userPromptTemplate: `Flag operational risks:
{operationsData}

Identify:
- Missing documents
- Overdue items
- Transit concerns
- Compliance gaps

These are flags for human review.`,
    variables: ['operationsData'],
    category: 'risk',
    icon: 'AlertTriangle'
  },
  {
    department: 'ZR',
    name: 'Handover Confirmation',
    description: 'Customer handover confirmation message',
    systemPrompt: 'Create professional handover confirmations.',
    userPromptTemplate: `Generate handover confirmation:
Customer: {customerName}
Vehicle: {carTitle} ({stockNo})
Handover date: {handoverDate}
Location: {location}
Documents provided: {documents}
Warranty info: {warranty}
Contact for issues: {contactInfo}

Create customer-friendly confirmation.`,
    variables: ['customerName', 'carTitle', 'stockNo', 'handoverDate', 'location', 'documents', 'warranty', 'contactInfo'],
    category: 'communications',
    icon: 'CheckCircle'
  }
];

// =====================================================
// PLAN AI CONFIGURATIONS
// =====================================================
const planConfigs = [
  {
    planKey: 'STARTER',
    monthlyRequestLimit: 0, // AI disabled
    aiEnabled: false,
    advancedTemplates: false,
    customTemplates: false,
    aiHistoryDays: 0,
    maxContextTokens: 0,
    maxOutputTokens: 0
  },
  {
    planKey: 'GROWTH',
    monthlyRequestLimit: 200,
    aiEnabled: true,
    advancedTemplates: false,
    customTemplates: false,
    aiHistoryDays: 30,
    maxContextTokens: 2000,
    maxOutputTokens: 1000
  },
  {
    planKey: 'PRO',
    monthlyRequestLimit: 1000,
    aiEnabled: true,
    advancedTemplates: true,
    customTemplates: true,
    aiHistoryDays: 90,
    maxContextTokens: 4000,
    maxOutputTokens: 2000
  },
  {
    planKey: 'ENTERPRISE',
    monthlyRequestLimit: -1, // Unlimited
    aiEnabled: true,
    advancedTemplates: true,
    customTemplates: true,
    aiHistoryDays: 365,
    maxContextTokens: 8000,
    maxOutputTokens: 4000
  }
];

// =====================================================
// SEED FUNCTION
// =====================================================
async function seedAiTemplates() {
  console.log('🤖 Seeding Denuel AI Templates...\n');

  // Combine all templates
  const allTemplates = [
    ...adminTemplates,
    ...salesTemplates,
    ...agentTemplates,
    ...accountantTemplates,
    ...hrTemplates,
    ...designTemplates,
    ...zrTemplates
  ];

  // Seed templates
  let created = 0;
  let updated = 0;

  for (const template of allTemplates) {
    const existing = await prisma.promptTemplate.findFirst({
      where: {
        tenantId: null,
        department: template.department,
        name: template.name
      }
    });

    if (existing) {
      await prisma.promptTemplate.update({
        where: { id: existing.id },
        data: {
          description: template.description,
          systemPrompt: template.systemPrompt,
          userPromptTemplate: template.userPromptTemplate,
          variablesJson: template.variables,
          category: template.category,
          icon: template.icon,
          isGlobal: true,
          isEnabled: true
        }
      });
      updated++;
    } else {
      await prisma.promptTemplate.create({
        data: {
          tenantId: null,
          department: template.department,
          name: template.name,
          description: template.description,
          systemPrompt: template.systemPrompt,
          userPromptTemplate: template.userPromptTemplate,
          variablesJson: template.variables,
          category: template.category,
          icon: template.icon,
          isGlobal: true,
          isEnabled: true,
          sortOrder: 0
        }
      });
      created++;
    }
  }

  console.log(`✅ Templates: ${created} created, ${updated} updated`);

  // Seed plan configurations
  for (const config of planConfigs) {
    await prisma.planAiConfig.upsert({
      where: { planKey: config.planKey },
      update: config,
      create: config
    });
  }

  console.log(`✅ Plan AI configs seeded`);
  console.log('\n🎉 AI Templates seeding complete!');
}

// Run if executed directly
seedAiTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const allTemplates = [...adminTemplates, ...salesTemplates, ...agentTemplates, ...accountantTemplates, ...hrTemplates, ...designTemplates, ...zrTemplates];

export { seedAiTemplates, allTemplates };
