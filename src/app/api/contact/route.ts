import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging';
import { withPerformanceLogging } from '@/lib/logging';

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  projectType: z.enum([
    'web-development',
    'mobile-development',
    'robotics',
    'ai-ml',
    'consulting',
    'other'
  ]).optional(),
  
  budget: z.enum([
    'under-5k',
    '5k-15k',
    '15k-50k',
    'over-50k',
    'discuss'
  ]).optional(),
  
  timeline: z.enum([
    'urgent',
    '1-month',
    '2-3-months',
    '3-6-months',
    'flexible'
  ]).optional(),
  
  referralSource: z.enum([
    'search',
    'social-media',
    'referral',
    'portfolio',
    'github',
    'other'
  ]).optional(),
  
  consent: z.boolean()
    .refine(val => val === true, 'You must consent to data processing')
});

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per window

// Spam detection keywords
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery', 'bitcoin', 'crypto', 'investment',
  'make money fast', 'guaranteed income', 'click here', 'free money'
];

interface ContactFormData extends z.infer<typeof contactFormSchema> {
  timestamp: string;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  id?: string;
  errors?: Record<string, string[]>;
}

/**
 * Contact form submission handler
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContactResponse>> {
  return withPerformanceLogging(async () => {
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    logger.info('Contact form submission received', { ip, userAgent });

    try {
      // Rate limiting check
      const rateLimitResult = checkRateLimit(ip);
      if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded', { 
          ip, 
          remainingTime: rateLimitResult.remainingTime 
        });
        
        return NextResponse.json(
          {
            success: false,
            message: `Too many requests. Please try again in ${Math.ceil(rateLimitResult.remainingTime / 1000 / 60)} minutes.`,
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(rateLimitResult.remainingTime / 1000)),
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            }
          }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      
      // Validate form data
      const validationResult = contactFormSchema.safeParse(body);
      if (!validationResult.success) {
        const errors: Record<string, string[]> = {};
        validationResult.error.errors.forEach(error => {
          const field = error.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(error.message);
        });

        logger.warn('Contact form validation failed', { errors, ip });

        return NextResponse.json(
          {
            success: false,
            message: 'Please correct the errors in the form.',
            errors
          },
          { status: 400 }
        );
      }

      const formData = validationResult.data;

      // Spam detection
      const spamScore = calculateSpamScore(formData);
      if (spamScore > 0.7) {
        logger.warn('Potential spam detected', { 
          spamScore, 
          formData: { name: formData.name, email: formData.email, subject: formData.subject },
          ip 
        });

        // Return success to prevent spam bots from knowing they were blocked
        return NextResponse.json({
          success: true,
          message: 'Thank you for your message. We will get back to you soon!',
        });
      }

      // Prepare contact data
      const contactData: ContactFormData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent,
        ip,
        sessionId: generateSessionId(),
      };

      // Process the contact form
      const result = await processContactForm(contactData);

      if (result.success) {
        // Update rate limit counter
        updateRateLimit(ip);

        logger.info('Contact form processed successfully', { 
          id: result.id,
          name: formData.name,
          email: formData.email,
          ip 
        });

        return NextResponse.json({
          success: true,
          message: 'Thank you for your message! I will get back to you within 24 hours.',
          id: result.id
        });
      } else {
        logger.error('Failed to process contact form', new Error(result.error || 'Unknown error'), { 
          formData: { name: formData.name, email: formData.email },
          ip 
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again or contact me directly.',
          },
          { status: 500 }
        );
      }

    } catch (error) {
      logger.error('Contact form error', error as Error, { ip, userAgent });

      return NextResponse.json(
        {
          success: false,
          message: 'An unexpected error occurred. Please try again later.',
        },
        { status: 500 }
      );
    }
  }, 'contact-form-submission');
}

/**
 * Get contact form configuration
 */
export async function GET(): Promise<NextResponse> {
  const config = {
    maxMessageLength: 2000,
    maxNameLength: 50,
    maxSubjectLength: 100,
    projectTypes: [
      { value: 'web-development', label: 'Web Development' },
      { value: 'mobile-development', label: 'Mobile Development' },
      { value: 'robotics', label: 'Robotics & Automation' },
      { value: 'ai-ml', label: 'AI & Machine Learning' },
      { value: 'consulting', label: 'Technical Consulting' },
      { value: 'other', label: 'Other' }
    ],
    budgetRanges: [
      { value: 'under-5k', label: 'Under $5,000' },
      { value: '5k-15k', label: '$5,000 - $15,000' },
      { value: '15k-50k', label: '$15,000 - $50,000' },
      { value: 'over-50k', label: 'Over $50,000' },
      { value: 'discuss', label: 'Let\'s discuss' }
    ],
    timelines: [
      { value: 'urgent', label: 'ASAP (Rush job)' },
      { value: '1-month', label: 'Within 1 month' },
      { value: '2-3-months', label: '2-3 months' },
      { value: '3-6-months', label: '3-6 months' },
      { value: 'flexible', label: 'Flexible timeline' }
    ]
  };

  return NextResponse.json(config);
}

/**
 * Rate limiting logic
 */
function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  remainingTime: number;
} {
  const now = Date.now();
  const key = identifier;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      remainingTime: RATE_LIMIT_WINDOW
    };
  }

  const remaining = RATE_LIMIT_MAX_REQUESTS - existing.count;
  const remainingTime = existing.resetTime - now;

  return {
    allowed: existing.count < RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, remaining),
    resetTime: existing.resetTime,
    remainingTime
  };
}

/**
 * Update rate limit counter
 */
function updateRateLimit(identifier: string): void {
  const existing = rateLimitStore.get(identifier);
  if (existing) {
    existing.count += 1;
    rateLimitStore.set(identifier, existing);
  }
}

/**
 * Calculate spam score based on various factors
 */
function calculateSpamScore(formData: z.infer<typeof contactFormSchema>): number {
  let score = 0;

  // Check for spam keywords
  const textToCheck = `${formData.name} ${formData.subject} ${formData.message}`.toLowerCase();
  const spamKeywordCount = SPAM_KEYWORDS.filter(keyword => 
    textToCheck.includes(keyword.toLowerCase())
  ).length;
  
  if (spamKeywordCount > 0) {
    score += spamKeywordCount * 0.3;
  }

  // Check for excessive capitalization
  const capsRatio = (textToCheck.match(/[A-Z]/g) || []).length / textToCheck.length;
  if (capsRatio > 0.7) {
    score += 0.4;
  }

  // Check for excessive punctuation
  const punctuationRatio = (textToCheck.match(/[!@#$%^&*()]/g) || []).length / textToCheck.length;
  if (punctuationRatio > 0.1) {
    score += 0.3;
  }

  // Check for URL patterns
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urlCount = (textToCheck.match(urlPattern) || []).length;
  if (urlCount > 2) {
    score += urlCount * 0.2;
  }

  // Check for very short messages with generic content
  if (formData.message.length < 50 && 
      formData.message.toLowerCase().includes('interested') &&
      formData.message.toLowerCase().includes('contact')) {
    score += 0.4;
  }

  // Check for suspicious email patterns
  const suspiciousEmailPatterns = [
    /^[a-zA-Z]+\d+@/,  // name followed by numbers
    /^\d+[a-zA-Z]+@/,  // numbers followed by letters
    /^[a-zA-Z]{1,3}@/  // very short usernames
  ];
  
  const hasSuspiciousEmail = suspiciousEmailPatterns.some(pattern => 
    pattern.test(formData.email)
  );
  
  if (hasSuspiciousEmail) {
    score += 0.3;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Process contact form submission
 */
async function processContactForm(contactData: ContactFormData): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    // Generate unique ID for this submission
    const submissionId = generateSubmissionId();

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    // 4. Send auto-response to user

    // For now, we'll simulate the process and log the data
    logger.info('Contact form data processed', {
      id: submissionId,
      data: {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        messageLength: contactData.message.length,
        company: contactData.company,
        projectType: contactData.projectType,
        budget: contactData.budget,
        timeline: contactData.timeline,
        referralSource: contactData.referralSource,
        timestamp: contactData.timestamp
      }
    });

    // Simulate email sending
    const emailResult = await sendContactNotification(contactData, submissionId);
    if (!emailResult.success) {
      logger.error('Failed to send contact notification', new Error(emailResult.error || 'Unknown error'), { 
        id: submissionId 
      });
    }

    // Simulate auto-response
    const autoResponseResult = await sendAutoResponse(contactData, submissionId);
    if (!autoResponseResult.success) {
      logger.warn('Failed to send auto-response', { 
        error: autoResponseResult.error || 'Unknown error',
        id: submissionId 
      });
    }

    return {
      success: true,
      id: submissionId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send contact notification email (simulated)
 */
async function sendContactNotification(
  contactData: ContactFormData, 
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Google Cloud Functions with email service

    logger.info('Contact notification email sent', {
      id: submissionId,
      to: 'contact@shivambhardwaj.com',
      subject: `New Contact Form Submission: ${contactData.subject}`,
      from: contactData.email
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed'
    };
  }
}

/**
 * Send auto-response email (simulated)
 */
async function sendAutoResponse(
  contactData: ContactFormData,
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Auto-response email sent', {
      id: submissionId,
      to: contactData.email,
      subject: `Thank you for your message - ${contactData.subject}`
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Auto-response failed'
    };
  }
}

/**
 * Generate unique submission ID
 */
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `contact_${timestamp}_${random}`.toUpperCase();
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Cleanup rate limit store periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1 hour