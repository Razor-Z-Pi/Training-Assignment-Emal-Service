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
    const missingMap = new Map<string, { key: string; reason: string; field: string }>();
    const unresolvedMap = new Map<string, { key: string; reason: string; field: string }>();
    const warningsMap = new Map<string, { key: string; reason: string; usedValue: string; fallback: string }>();

    const renderText = (text: string) =>
      text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
        const def = VARIABLES.find((v: VariableDef) => v.key === key);
        if (!def) {
          unresolvedMap.set(key, { key, reason: 'unknown_variable', field: 'unknown' });
          return `{{${key}}}`;
        }
        const direct = candidate?.[key] ?? context?.[key];
        if (direct != null && direct !== '') return String(direct);

        if (def.fallback) {
          const fb = candidate?.[def.fallback] ?? context?.[def.fallback];
          if (fb) {
            warningsMap.set(key, {
              key,
              reason: 'fallback_used',
              usedValue: fb,
              fallback: def.fallback,
            });
            return String(fb);
          }
        }

        const field = key in (candidate ?? {}) ? 'candidate' : 'context';
        const entry = { key, reason: 'no_data', field };
        if (def.required) missingMap.set(key, entry);
        else unresolvedMap.set(key, entry);
        return `{{${key}}}`;
      });

    return {
      ready: missingMap.size === 0,
      rendered: { subject: renderText(subject), body: renderText(template) },
      missing: [...missingMap.values()],
      unresolved: [...unresolvedMap.values()],
      warnings: [...warningsMap.values()],
    };
  }
}