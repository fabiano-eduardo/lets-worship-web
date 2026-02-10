// Validation utilities for arrangement block content
//
// Checks that inline delimiters {} and [] are balanced and not cross-nested.

export interface BlockValidationError {
  blockIndex: number;
  blockId: string;
  blockLabel: string;
  message: string;
}

/**
 * Validate that `{` / `}` and `[` / `]` are balanced and not cross-nested.
 *
 * Cross-nesting means `{` inside `[…]` or `[` inside `{…}`.
 *
 * Returns a list of errors (empty = valid).
 */
export function validateInlineDelimiters(
  content: string,
  blockIndex: number,
  blockId: string,
  blockLabel: string,
): BlockValidationError[] {
  const errors: BlockValidationError[] = [];

  const lines = content.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let inBrace = false; // inside { }
    let inBracket = false; // inside [ ]

    for (let col = 0; col < line.length; col++) {
      const ch = line[col];

      if (ch === "{") {
        if (inBracket) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "{" dentro de colchetes "[…]" não é permitido.`,
          });
          return errors; // fail fast per block
        }
        if (inBrace) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "{" duplicado sem fechar o anterior.`,
          });
          return errors;
        }
        inBrace = true;
      } else if (ch === "}") {
        if (!inBrace) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "}" sem "{" correspondente.`,
          });
          return errors;
        }
        inBrace = false;
      } else if (ch === "[") {
        if (inBrace) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "[" dentro de chaves "{…}" não é permitido.`,
          });
          return errors;
        }
        if (inBracket) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "[" duplicado sem fechar o anterior.`,
          });
          return errors;
        }
        inBracket = true;
      } else if (ch === "]") {
        if (!inBracket) {
          errors.push({
            blockIndex,
            blockId,
            blockLabel,
            message: `Linha ${lineIdx + 1}: "]" sem "[" correspondente.`,
          });
          return errors;
        }
        inBracket = false;
      }
    }

    // Check for unclosed delimiters at end of line
    if (inBrace) {
      errors.push({
        blockIndex,
        blockId,
        blockLabel,
        message: `Linha ${lineIdx + 1}: "{" não foi fechada com "}".`,
      });
      return errors;
    }
    if (inBracket) {
      errors.push({
        blockIndex,
        blockId,
        blockLabel,
        message: `Linha ${lineIdx + 1}: "[" não foi fechado com "]".`,
      });
      return errors;
    }
  }

  return errors;
}

/**
 * Validate all blocks. Returns an array of errors (empty = all valid).
 */
export function validateAllBlocks(
  blocks: ReadonlyArray<{
    id: string;
    label?: string | null;
    content: string;
  }>,
): BlockValidationError[] {
  const errors: BlockValidationError[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const label = block.label?.trim() || `Bloco ${i + 1}`;
    const blockErrors = validateInlineDelimiters(
      block.content,
      i,
      block.id,
      label,
    );
    errors.push(...blockErrors);
  }

  return errors;
}
