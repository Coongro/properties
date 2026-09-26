// Generado por el Coongro Builder desde contributes.permissions. No editar a mano.

export const PropertiesPermissions = {
  /** Eliminar liquidaciones de expensas */
  buildingExpensesDelete: 'properties.buildingExpenses.delete',
  /** Gestionar liquidaciones de expensas */
  buildingExpensesManage: 'properties.buildingExpenses.manage',
  /** Ver liquidaciones de expensas */
  buildingExpensesRead: 'properties.buildingExpenses.read',
  /** Eliminar propiedades */
  buildingsDelete: 'properties.buildings.delete',
  /** Gestionar propiedades */
  buildingsManage: 'properties.buildings.manage',
  /** Ver propiedades */
  buildingsRead: 'properties.buildings.read',
  /** Eliminar certificados */
  certificatesDelete: 'properties.certificates.delete',
  /** Gestionar certificados */
  certificatesManage: 'properties.certificates.manage',
  /** Ver certificados */
  certificatesRead: 'properties.certificates.read',
  /** Eliminar propietarios */
  unitOwnersDelete: 'properties.unitOwners.delete',
  /** Gestionar propietarios */
  unitOwnersManage: 'properties.unitOwners.manage',
  /** Ver propietarios */
  unitOwnersRead: 'properties.unitOwners.read',
  /** Eliminar unidades */
  unitsDelete: 'properties.units.delete',
  /** Gestionar unidades */
  unitsManage: 'properties.units.manage',
  /** Ver unidades */
  unitsRead: 'properties.units.read',
} as const;

export type PropertiesPermission =
  (typeof PropertiesPermissions)[keyof typeof PropertiesPermissions];
