/**
 * Valida um CPF usando o algoritmo oficial dos dígitos verificadores.
 * Aceita CPF com ou sem formatação (pontos e traço).
 */
export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "")

  if (cpf.length !== 11) return false

  // Rejeita sequências de dígitos iguais (ex: 000.000.000-00)
  if (/^(\d)\1+$/.test(cpf)) return false

  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf[9])) return false

  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf[10])) return false

  return true
}
