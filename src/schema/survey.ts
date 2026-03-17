import { z } from 'zod'

const identifierSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9_-]+$/, 'Identifier must be a single word token')

const htmlTextSchema = z.string().min(1)

const keyedRecordSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.record(identifierSchema, valueSchema)

const digitKeyedTextSchema = z.record(
  z.string().regex(/^[0-9]$/, 'Associative left group keys must be single digits'),
  htmlTextSchema
)

const letterKeyedTextSchema = z.record(
  z.string().regex(/^[A-Za-z]$/, 'Associative right group keys must be single letters'),
  htmlTextSchema
)

export const singleChoiceQuestionSchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  type: z.literal('single-choice'),
  content: keyedRecordSchema(htmlTextSchema).superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Single-choice questions must define at least one option'
      })
    }
  })
})

export const multiChoiceQuestionSchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  type: z.literal('multi-choice'),
  content: keyedRecordSchema(htmlTextSchema).superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multi-choice questions must define at least one option'
      })
    }
  })
})

export const freeTextQuestionSchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  type: z.literal('free-text')
})

export const associativeQuestionSchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  type: z.literal('associative'),
  content: z
    .object({
      left: digitKeyedTextSchema,
      right: letterKeyedTextSchema
    })
    .superRefine((value, ctx) => {
      if (Object.keys(value.left).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Associative questions must define at least one left-side phrase',
          path: ['left']
        })
      }
      if (Object.keys(value.right).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Associative questions must define at least one right-side phrase',
          path: ['right']
        })
      }
    })
})

export const questionSchema = z.discriminatedUnion('type', [
  singleChoiceQuestionSchema,
  multiChoiceQuestionSchema,
  freeTextQuestionSchema,
  associativeQuestionSchema
])

const questionListSchema = keyedRecordSchema(questionSchema)

export const sectionSchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  questions: questionListSchema.optional()
})

const sectionListSchema = keyedRecordSchema(sectionSchema)

export const surveySchema = z.object({
  title: htmlTextSchema,
  description: htmlTextSchema.optional(),
  sections: sectionListSchema
})

const singleChoiceAnswerSchema = z.object({
  type: z.literal('single-choice'),
  value: identifierSchema
})

const multiChoiceAnswerSchema = z.object({
  type: z.literal('multi-choice'),
  value: z.array(identifierSchema)
})

const freeTextAnswerSchema = z.object({
  type: z.literal('free-text'),
  value: z.string()
})

const associativeAnswerSchema = z.object({
  type: z.literal('associative'),
  value: z.array(
    z.object({
      left: z.string().regex(/^[0-9]$/, 'Associative answer left key must be a single digit'),
      right: z.string().regex(/^[A-Za-z]$/, 'Associative answer right key must be a single letter')
    })
  )
})

export const answerValueSchema = z.discriminatedUnion('type', [
  singleChoiceAnswerSchema,
  multiChoiceAnswerSchema,
  freeTextAnswerSchema,
  associativeAnswerSchema
])

export const answerFileSchema = z.object({
  surveyTitle: htmlTextSchema,
  answers: keyedRecordSchema(answerValueSchema)
})

export type Survey = z.infer<typeof surveySchema>
export type SurveyQuestion = z.infer<typeof questionSchema>
export type SurveySection = z.infer<typeof sectionSchema>
export type AnswerFile = z.infer<typeof answerFileSchema>
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>
export type MultiChoiceQuestion = z.infer<typeof multiChoiceQuestionSchema>
export type AssociativeQuestion = z.infer<typeof associativeQuestionSchema>

export function parseSurvey(input: unknown): Survey {
  return surveySchema.parse(input)
}

export function parseAnswerFile(input: unknown): AnswerFile {
  return answerFileSchema.parse(input)
}
