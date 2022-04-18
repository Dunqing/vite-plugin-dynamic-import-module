import type { BaseNode } from 'estree-walker'
import type { BinaryExpression, CallExpression, Literal, TemplateLiteral } from 'estree'

export class VariableDynamicImportError extends Error {}

function sanitizeString(str: any) {
  if (str.includes('*'))
    throw new VariableDynamicImportError('A dynamic import cannot contain * characters.')

  return str
}

function templateLiteralToGlob(node: TemplateLiteral) {
  let glob = ''

  for (let i = 0; i < node.quasis.length; i += 1) {
    glob += sanitizeString(node.quasis[i].value.raw)
    if (node.expressions[i])
      glob += expressionToGlob(node.expressions[i])
  }

  return glob
}

function callExpressionToGlob(node: CallExpression) {
  const { callee } = node
  if (
    callee.type === 'MemberExpression'
    && callee.property.type === 'Identifier'
    && callee.property.name === 'concat'
  )
    return `${expressionToGlob(callee.object)}${node.arguments.map(expressionToGlob).join('')}`

  return '*'
}

function binaryExpressionToGlob(node: BinaryExpression) {
  if (node.operator !== '+')
    throw new VariableDynamicImportError(`${node.operator} operator is not supported.`)

  return `${expressionToGlob(node.left)}${expressionToGlob(node.right)}`
}

function expressionToGlob(node: BaseNode): string {
  switch (node.type) {
    case 'TemplateLiteral':
      return templateLiteralToGlob(node as TemplateLiteral)
    case 'CallExpression':
      return callExpressionToGlob(node as CallExpression)
    case 'BinaryExpression':
      return binaryExpressionToGlob(node as BinaryExpression)
    case 'Literal': {
      return sanitizeString((node as Literal).value)
    }
    default:
      return '*'
  }
}

export function parseImportExpression(node: BaseNode) {
  let glob = expressionToGlob(node)
  if (!glob.includes('*') || glob.startsWith('data:'))
    return null

  glob = glob.replace(/\*\*/g, '*')

  return glob
}
