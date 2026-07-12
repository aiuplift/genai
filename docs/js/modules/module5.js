/**
 * Module 5: Data Analysis and Visualisation with AI
 *
 * Activities:
 *   1. Formula Assistant Warm-up — describe a calculation, get AI formula, verify manually
 *   2. Dataset Analysis Pipeline — clean data, chart, insights, limitations
 *   3. Manual Verification — check computed values, assess trend claims, note discrepancies
 *   4. Module Quiz — 5-question knowledge check
 *   5. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { registerModule } from '../core/module-registry.js';

const module5 = {
  id: 'module5',
  title: 'Data Analysis and Visualisation with AI',
  description: 'Turn raw data into insights using AI — while building the verification habits that prevent costly analytical errors.',
  sections: [
    // ── 1. Welcome ──────────────────────────────────────────────────────────
    {
      type: 'content',
      title: 'Welcome to Module 5',
      content: `Welcome to Module 5 — where you'll learn to use AI as a powerful data assistant without becoming dependent on numbers you haven't verified.

<strong>What you'll walk away with:</strong>

• The ability to use AI for data tasks without being a data scientist — formula generation, data cleaning, chart selection, and pattern description
• A reliable workflow for verifying AI-generated insights before they reach stakeholders
• A clear understanding of AI's mathematical limitations — why it generates plausible-looking numbers rather than calculated ones
• Practical habits that separate professionals who use AI for data work from those who get burned by it

You don't need to be a spreadsheet expert or a statistician. You need to know how to ask AI the right questions, how to spot when its answers are wrong, and how to build verification into your workflow so errors never leave your desk.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How This Module Works',
      content: `Use the AI Chat (💬 button) throughout this module. Paste in data, ask for formulas, request analysis — then verify everything it gives you. The exercises below guide you through exactly that process. Your work saves automatically.`
    },

    // ── 2. AI and Numbers — A Complicated Relationship ──────────────────────
    {
      type: 'content',
      title: 'AI and Numbers — A Complicated Relationship',
      content: `Here's something that surprises most people: AI is remarkably good at understanding language but surprisingly unreliable with mathematics.

<strong>Why? Because AI doesn't calculate — it predicts.</strong>

When you ask AI "What's 47 × 83?" it doesn't multiply. It predicts what tokens are most likely to follow that question based on patterns in its training data. Usually the prediction matches the correct answer — but not always, and not reliably for complex arithmetic.

This is the fundamental insight: <strong>AI generates plausible-looking numbers, not verified calculations.</strong>

<strong>Examples of AI getting simple maths wrong:</strong>

• Ask AI to add a column of 20 numbers and it may give you a figure that's close but not exact — off by a rounding error or a skipped value
• Ask for a percentage change and it might confuse month-over-month with year-over-year, or use simple difference instead of percentage calculation
• Ask for an average and it might divide by the wrong count, especially if some cells are empty
• Ask about correlation and it will state a coefficient with confidence — without mentioning that it didn't actually compute one

The pattern is consistent: AI produces numbers that <em>look right</em>. They're in the right ballpark, formatted correctly, and stated with complete confidence. That's what makes them dangerous — plausible-looking wrong numbers are harder to catch than obviously wrong ones.

<strong>The key insight for data professionals:</strong> Use AI to generate formulas, suggest approaches, and describe patterns — but never trust a specific number it produces without independent verification.`
    },

    // ── 3. Where AI Excels in Data Work ─────────────────────────────────────
    {
      type: 'content',
      title: 'Where AI Excels in Data Work',
      content: `Despite its maths limitations, AI is genuinely excellent at several data tasks. Knowing where it's strong lets you use it confidently in those areas while staying sceptical where it's weak.

<strong>Formula generation from plain language</strong>
Tell AI "I need a formula that looks up a product name in column A and returns the corresponding price from column C, but only if the stock level in column D is above zero" — and it will give you a working VLOOKUP, INDEX/MATCH, or XLOOKUP formula. This is AI at its best: translating intent into syntax.

<strong>Data cleaning suggestions</strong>
Describe your messy data ("dates in mixed formats, some cells have text in number columns, duplicates across rows 12-45") and AI will suggest a systematic cleaning approach — what to fix first, what formulas to use, what to watch out for.

<strong>Chart type recommendations</strong>
Tell AI what story you're trying to tell with your data, and it will recommend appropriate visualisation types. "I want to show how three product lines performed relative to each other over 12 months" → line chart with three series, time on x-axis.

<strong>Pattern description</strong>
Paste actual data into AI and ask it to describe what it sees. It's good at noticing trends, seasonality, outliers, and groupings — though you must verify any specific numbers it cites.

<strong>Anomaly flagging</strong>
AI can scan data and flag values that seem unusual: "Row 37 shows revenue of $2.3M when every other month is between $180K and $220K — is this a data entry error or a genuine outlier?"

<strong>The common thread:</strong> AI excels at pattern recognition, language translation (human intent → formula syntax), and qualitative description. It struggles with precise arithmetic, statistical computation, and anything requiring actual calculation rather than prediction.`
    },

    // ── 4. The Formula Assistant Workflow ────────────────────────────────────
    {
      type: 'content',
      title: 'The Formula Assistant Workflow',
      content: `Here's the reliable process for using AI to generate spreadsheet formulas:

<strong>Step 1: Describe what you want in plain language</strong>
Be specific about your data layout. Instead of "calculate growth," say "I have monthly revenue in cells B2:B13. I need the month-over-month percentage growth for each month in column C, showing the result as a percentage with one decimal place."

<strong>Step 2: Get a formula from AI</strong>
The AI will typically give you the formula plus an explanation of how it works. Read the explanation — it helps you catch logical errors even before testing.

<strong>Step 3: Understand what it does</strong>
Before using any AI-generated formula, make sure you understand the logic. If the AI gives you =IFERROR(INDEX(MATCH(...)),"Not Found"), you should be able to explain what each part does. If you can't, ask the AI to break it down.

<strong>Step 4: Test on sample data</strong>
Apply the formula to a small subset of data where you already know (or can easily calculate) the correct answer. Don't test on your full dataset first — test on 3-5 rows where you can verify by hand.

<strong>Step 5: Verify results manually</strong>
Pick 2-3 results from your actual dataset and calculate them independently. If the formula gives you 23.4% growth for March, pull the February and March numbers and compute it yourself. This takes 30 seconds and catches formula errors before they propagate.

<strong>Pro tips:</strong>
• Always specify your spreadsheet application (Excel, Google Sheets, Numbers) — syntax differs
• Mention if you need the formula to handle errors, blanks, or text values gracefully
• Ask AI to explain any formula it generates — this is your quality check`
    },

    // ── 5. Activity: Formula Assistant Warm-up ──────────────────────────────
    {
      type: 'activity',
      activityId: 'formula-assistant-warmup'
    },

    // ── 6. Building a Data Analysis Pipeline with AI ────────────────────────
    {
      type: 'content',
      title: 'Building a Data Analysis Pipeline with AI',
      content: `When you have a dataset to analyse, AI can assist at every stage — but you remain the decision-maker and verifier throughout. Here's the 5-step process:

<strong>Step 1: Understand Your Data</strong>
Before asking AI anything, know what you're working with. How many rows and columns? What do the columns represent? What time period does it cover? Are there obvious gaps or anomalies? Paste a sample (first 10-20 rows) into AI and ask it to describe the structure — but verify its description against what you can see.

<strong>Step 2: Clean with AI Assistance</strong>
Describe the data quality issues you've noticed and ask AI for a cleaning strategy. AI is excellent at suggesting systematic approaches: "Remove duplicates based on columns A+B, convert date strings in column C to consistent YYYY-MM-DD format, flag rows where revenue is negative as these are likely refunds." You execute the cleaning; AI suggests the approach.

<strong>Step 3: Visualise with AI Suggestions</strong>
Tell AI what question you're trying to answer and what data you have available. It will recommend chart types, axis choices, and grouping strategies. Create the actual charts yourself from your verified data — don't ask AI to describe what a chart "would look like."

<strong>Step 4: Extract Insights</strong>
Once you have clean data and accurate visualisations, you can ask AI to help articulate what the patterns mean. "Given that Q3 revenue dropped 12% while marketing spend increased 20%, what questions should I investigate?" AI is good at generating hypotheses and framing narratives — but remember, the narrative must match your verified numbers.

<strong>Step 5: State Limitations Honestly</strong>
Every analysis has limitations. Ask AI to help you identify them: sample size issues, missing data, confounding variables, time period constraints, survivorship bias. AI is surprisingly good at this because it's a pattern-matching exercise — recognising what types of limitations apply to what types of analysis.

<strong>The golden rule:</strong> AI suggests, you verify, you decide. At no point does AI have the final say on any number that leaves your desk.`
    },

    // ── 7. Callout (warning) ────────────────────────────────────────────────
    {
      type: 'callout',
      variant: 'warning',
      title: 'Never Trust AI-Generated Statistics',
      content: `Never trust AI-generated statistics without manual verification. AI can confidently tell you "revenue increased 23% quarter-over-quarter" when the actual number is 8%. It generates plausible-sounding figures, not calculated ones. If a number appears in an AI response, treat it as a hypothesis to verify — not a fact to report.`
    },

    // ── 8. Activity: Dataset Analysis Pipeline ──────────────────────────────
    {
      type: 'activity',
      activityId: 'dataset-analysis-pipeline'
    },

    // ── 9. The Verification Imperative ──────────────────────────────────────
    {
      type: 'content',
      title: 'The Verification Imperative',
      content: `Manual verification isn't optional when AI is involved in data work. It's not a nice-to-have or a best practice — it's the difference between useful analysis and dangerous misinformation.

<strong>Why this matters more than you think:</strong>

Stories from the real world: AI-generated reports with wrong numbers have reached leadership teams, been presented in board meetings, and informed strategic decisions — all because someone trusted AI-produced figures without checking. A 2% error in a growth rate might seem small, but when it's the difference between "we're beating targets" and "we're behind plan," it changes decisions worth millions.

<strong>The 3-Check System:</strong>

<strong>Check 1: Verify Calculations</strong>
Pick any specific number AI has produced and reproduce it manually. If AI says "average deal size is $47,200" — pull the actual deal values and compute the average yourself. If it says "conversion rate improved 3.2 percentage points" — find the before and after rates and subtract. This catches arithmetic errors, wrong denominators, and formula mistakes.

<strong>Check 2: Verify Trends</strong>
If AI claims something went up, down, or stayed flat — look at the actual data points. Plot them yourself if needed. AI might say "steady growth" when the data actually shows flat performance with one spike that skews the average. Trends are descriptions of patterns, and AI sometimes describes the pattern it expects rather than the one that exists.

<strong>Check 3: Verify Attribution</strong>
When AI claims a cause ("revenue grew because of the new marketing campaign"), ask: does the timeline actually support this? Are there confounding factors? AI loves to assign causation to correlation because it generates satisfying narratives. Your job is to challenge every causal claim with "what else could explain this?"

<strong>The effort-to-risk ratio:</strong> Verification takes 5-10 minutes. Presenting wrong numbers to leadership takes 5 seconds and costs you months of credibility. The maths is simple.`
    },

    // ── 10. Activity: Manual Verification ───────────────────────────────────
    {
      type: 'activity',
      activityId: 'manual-verification'
    },

    // ── 11. Callout (tip) ───────────────────────────────────────────────────
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Best Verification Prompt',
      content: `The best prompt for data verification: "Show me the formula used to calculate each number in this analysis. Walk through the calculation step by step." If the AI can't reproduce its own numbers, they're likely hallucinated.`
    },

    // ── 12. Activity: Module Quiz ───────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module5-quiz'
    },

    // ── 13. Activity: Feedback ──────────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module5-feedback'
    }
  ],

  activities: [
    // ─── Activity 1: Formula Assistant Warm-up ──────────────────────────────
    {
      id: 'formula-assistant-warmup',
      title: 'Formula Assistant Warm-up',
      type: 'form',
      description: 'Describe a calculation in plain language, use AI to generate a formula, then manually verify the result. Use the AI Chat to generate your formula — then prove it works.',
      fields: [
        {
          id: 'description',
          label: 'Plain Language Description',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Describe the calculation you want in plain language. E.g. "I need a formula that calculates the percentage difference between this month\'s sales (B2) and last month\'s sales (B1), displayed as a percentage..."'
        },
        {
          id: 'formula',
          label: 'AI-Generated Formula',
          type: 'text',
          maxLength: 300,
          minLength: 1,
          required: true,
          placeholder: 'Paste the formula generated by AI (e.g. =(B2-B1)/B1*100 )'
        },
        {
          id: 'verification',
          label: 'Manual Verification Result',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Test the formula on sample data. Show the numbers you used, the expected result, and whether the formula produced the correct answer...'
        }
      ],
      completionRule: 'all_fields_filled'
    },

    // ─── Activity 2: Dataset Analysis Pipeline ──────────────────────────────
    {
      id: 'dataset-analysis-pipeline',
      title: 'Dataset Analysis Pipeline',
      type: 'form',
      description: 'Work through the full 5-step data analysis pipeline: understand and clean your data, visualise it, extract insights, and honestly state limitations. Use any dataset you have — or ask the AI Chat to generate sample data for practice.',
      fields: [
        {
          id: 'cleaning-notes',
          label: 'Data Cleaning Notes',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Document the data cleaning steps you took or that AI suggested (e.g. removed 3 duplicate rows, converted date format in column C, flagged 2 negative values in revenue column as likely refunds)...'
        },
        {
          id: 'chart-description',
          label: 'Chart Description',
          type: 'textarea',
          maxLength: 500,
          minLength: 0,
          required: false,
          placeholder: 'Describe the chart you created: chart type, what\'s on each axis, key patterns visible, and why you chose this visualisation type...'
        },
        {
          id: 'chart-upload',
          label: 'Chart Image Upload',
          type: 'file_upload',
          required: false,
          acceptedFormats: ['image/png', 'image/jpeg', 'application/pdf'],
          maxSize: 10485760,
          hint: 'Upload a chart image (PNG, JPG, or PDF, max 10 MB). You may provide a chart description instead.'
        },
        {
          id: 'insight-summary',
          label: 'Insight Summary',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Summarise the key insights from your analysis. What story does the data tell? What patterns did you find? Include only insights you have verified...'
        },
        {
          id: 'limitations',
          label: 'Stated Limitations',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Honestly state what this analysis cannot tell you — sample size issues, missing data, time period constraints, confounding variables, assumptions made...'
        }
      ],
      customValidation: {
        rule: 'at_least_one',
        fields: ['chart-description', 'chart-upload'],
        message: 'Please provide either a chart description or upload a chart image.'
      },
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 3: Manual Verification ────────────────────────────────────
    {
      id: 'manual-verification',
      title: 'Manual Verification',
      type: 'form',
      description: 'Apply the 3-check system to an AI-generated analysis. Ask the AI Chat to analyse some data, then manually verify its computed values, assess its trend claims, and document any discrepancies you find.',
      fields: [
        {
          id: 'computed-values',
          label: 'Computed Values Checked',
          type: 'structured_table',
          required: true,
          minRows: 1,
          columns: [
            { id: 'value', label: 'Computed Value', type: 'textarea', maxLength: 500, minLength: 1 }
          ],
          placeholder: 'Add at least one computed value that you verified manually. Show the AI\'s number vs your calculation...'
        },
        {
          id: 'trend-claims',
          label: 'Trend Claims Assessed',
          type: 'structured_table',
          required: true,
          minRows: 1,
          columns: [
            { id: 'claim', label: 'Trend Claim', type: 'textarea', maxLength: 500, minLength: 1 }
          ],
          placeholder: 'Add at least one trend claim the AI made. Did the data actually support it?...'
        },
        {
          id: 'discrepancies',
          label: 'Discrepancies Found',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Document any discrepancies between AI output and your manual verification. If everything matched, explain what you checked and how...'
        }
      ],
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 4: Module Quiz ────────────────────────────────────────────
    {
      id: 'module5-quiz',
      title: 'Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of AI-assisted data analysis, its strengths, and its critical limitations.',
      questions: [
        {
          id: 'q1',
          text: 'Why is AI unreliable with mathematical calculations?',
          options: [
            { id: 'a', text: 'AI doesn\'t have access to a calculator app' },
            { id: 'b', text: 'It predicts probable tokens based on patterns — it doesn\'t actually compute' },
            { id: 'c', text: 'AI was never trained on maths problems' },
            { id: 'd', text: 'Maths requires internet access that AI doesn\'t have' }
          ],
          correctAnswer: 'b',
          explanation: 'AI generates text by predicting the most likely next token. When it produces "47 × 83 = 3,901" it\'s not multiplying — it\'s predicting what number is most likely to follow that equation based on training patterns. This means it often gets close but not exact, especially with complex or unusual calculations.'
        },
        {
          id: 'q2',
          text: 'You ask AI "what\'s the average of these 50 numbers" and it gives you a figure. What should you do?',
          options: [
            { id: 'a', text: 'Trust it — averages are simple enough for AI' },
            { id: 'b', text: 'Ask AI the same question again to see if it gives the same answer' },
            { id: 'c', text: 'Calculate it yourself to verify — AI frequently gets arithmetic wrong' },
            { id: 'd', text: 'Round the number to make it look more professional' }
          ],
          correctAnswer: 'c',
          explanation: 'Even simple arithmetic like averages can be wrong when AI produces them. It might skip numbers, miscount rows, or make addition errors. Computing the average yourself (or using a spreadsheet formula on the actual data) takes seconds and gives you a verified figure you can confidently report.'
        },
        {
          id: 'q3',
          text: 'What\'s the safest way to use AI for data visualisation?',
          options: [
            { id: 'a', text: 'Ask AI to generate the chart image directly' },
            { id: 'b', text: 'Have AI suggest chart types and describe patterns, but create the actual charts from verified data' },
            { id: 'c', text: 'Let AI pick whatever chart type it thinks is best' },
            { id: 'd', text: 'Don\'t use AI for data visualisation at all' }
          ],
          correctAnswer: 'b',
          explanation: 'AI is excellent at recommending appropriate chart types and describing what patterns to look for. But the actual chart should be built from your verified data using a charting tool — not described or approximated by AI. This way the visual accurately represents real numbers.'
        },
        {
          id: 'q4',
          text: 'An AI-generated analysis claims "sales grew 15% in Q3." What\'s your first verification step?',
          options: [
            { id: 'a', text: 'Ask the AI if it\'s confident about that number' },
            { id: 'b', text: 'Google average industry growth rates to see if 15% is reasonable' },
            { id: 'c', text: 'Check the actual Q2 and Q3 numbers and calculate the growth rate yourself' },
            { id: 'd', text: 'Change it to "approximately 15%" to hedge' }
          ],
          correctAnswer: 'c',
          explanation: 'The only way to verify a growth claim is to check the source numbers and do the calculation yourself. Pull the Q2 total and Q3 total, compute (Q3-Q2)/Q2 × 100, and compare to what AI stated. If it said 15% but the real number is 8%, you\'ve just prevented a significant error from reaching stakeholders.'
        },
        {
          id: 'q5',
          text: 'Which data task is AI MOST reliable for?',
          options: [
            { id: 'a', text: 'Computing exact statistical measures like standard deviation' },
            { id: 'b', text: 'Suggesting data cleaning steps and identifying potential data quality issues' },
            { id: 'c', text: 'Producing precise percentage changes between time periods' },
            { id: 'd', text: 'Calculating correlation coefficients from raw data' }
          ],
          correctAnswer: 'b',
          explanation: 'Data cleaning suggestions are a language and pattern-recognition task — exactly what AI excels at. It can identify likely issues (mixed date formats, probable duplicates, suspicious outliers) and suggest systematic approaches to fix them. The other options all involve precise mathematical computation, where AI is unreliable.'
        }
      ]
    },

    // ─── Activity 5: Reflection & Feedback ──────────────────────────────────
    {
      id: 'module5-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on what you\'ve learned about AI-assisted data work and how you\'ll apply verification habits going forward.',
      fields: [
        { id: 'data-task', label: 'What specific data task will you try with AI this week?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'verification-habit', label: 'What\'s your personal rule for verifying AI-generated numbers before sharing them?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'key-takeaway', label: 'What was the most surprising or useful thing you learned in this module?', type: 'textarea', maxLength: 400, minLength: 1 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module5);

export default module5;
