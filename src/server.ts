/**
 * @coongro/properties — Exportaciones server-only
 *
 * Schema tables y repositories (dependen de drizzle-orm).
 * NO importar desde el browser — usar '@coongro/properties' para hooks/componentes.
 */
export * from './schema/building.js';
export { BuildingRepository } from './repositories/building.repository.js';
export * from './schema/unit.js';
export { UnitRepository } from './repositories/unit.repository.js';
export * from './schema/certificate.js';
export { CertificateRepository } from './repositories/certificate.repository.js';
export * from './schema/unit-owner.js';
export { UnitOwnerRepository } from './repositories/unit-owner.repository.js';
export * from './schema/building-expense.js';
export { BuildingExpenseRepository } from './repositories/building-expense.repository.js';
