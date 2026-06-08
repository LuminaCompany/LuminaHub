import { z } from "zod";

// ── Client ────────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  contact: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ── Service ───────────────────────────────────────────────────────────────────

export const SERVICE_TYPES = [
  "Automação",
  "Site de Gestão",
  "Site Marketing",
] as const;

export const serviceSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  types: z
    .array(z.string())
    .min(1, "Selecione pelo menos um tipo de serviço"),
  start_date: z.string().optional(),
  end_date_estimated: z.string().optional(),
  status: z
    .enum(["in_progress", "completed", "cancelled"])
    .optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// ── Payment ───────────────────────────────────────────────────────────────────

export const paymentSchema = z
  .object({
    service_id: z.string().min(1, "Serviço é obrigatório"),
    modality: z.enum(["upfront", "installment", "post_delivery"], {
      error: "Selecione a modalidade de pagamento",
    }),
    total_amount: z
      .number({ error: "Valor total é obrigatório" })
      .positive("Valor deve ser positivo"),
    installment_count: z.number().int().optional(),
    first_payment_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modality === "installment") {
      if (
        data.installment_count === undefined ||
        data.installment_count === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de parcelas é obrigatório",
          path: ["installment_count"],
        });
      } else if (data.installment_count <= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de parcelas deve ser maior que 1",
          path: ["installment_count"],
        });
      }

      if (!data.first_payment_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data do primeiro pagamento é obrigatória",
          path: ["first_payment_date"],
        });
      }
    }
  });

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ── Transaction ───────────────────────────────────────────────────────────────

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    error: "Selecione o tipo de transação",
  }),
  amount: z
    .number({ error: "Valor é obrigatório" })
    .positive("Valor deve ser positivo"),
  description: z.string().optional(),
  competence_date: z.string().min(1, "Data de competência é obrigatória"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
