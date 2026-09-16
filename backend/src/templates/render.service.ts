import { Injectable } from '@nestjs/common';
import { VARIABLES, VariableDef } from './variables.registry';

export interface RenderResult {
  ready: boolean;
  rendered: { subject: string; body: string };
  missing: Array<{ key: string; reason: string; field: string }>;
  unresolved: Array<{ key: string; reason: string; field: string }>;
  warnings: Array<{ key: string; reason: string; usedValue: string; fallback: string }>;
}

@Injectable()
export class RenderService {
  render(template: string, subject: string, candidate: any, context: any): RenderResult {
    const missing: RenderResult['missing'] = [];
    const unresolved: RenderResult['unresolved'] = [];
    const warnings: RenderResult['warnings'] = [];

    const renderText = (text: string) =>
      text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
        const def = VARIABLES.find((v: VariableDef) => v.key === key);
        if (!def) {
          unresolved.push({ key, reason: 'unknown_variable', field: 'unknown' });
          return `{{${key}}}`;
        }
        const direct = candidate?.[key] ?? context?.[key];
        if (direct != null && direct !== '') return String(direct);

        if (def.fallback) {
          const fb = candidate?.[def.fallback] ?? context?.[def.fallback];
          if (fb) {
            warnings.push({ key, reason: 'fallback_used', usedValue: fb, fallback: def.fallback });
            return String(fb);
          }
        }

        const field = key in (candidate ?? {}) ? 'candidate' : 'context';
        if (def.required) missing.push({ key, reason: 'no_data', field });
        else unresolved.push({ key, reason: 'no_data', field });
        return `{{${key}}}`;
      });

    return {
      ready: missing.length === 0,
      rendered: { subject: renderText(subject), body: renderText(template) },
      missing, unresolved, warnings,
    };
  }
}