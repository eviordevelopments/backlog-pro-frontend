import * as ts from 'typescript';
import * as fs from 'fs';

export interface CRUDMethod {
  name: string;
  signature: string;
  entity: string;
  operation: 'create' | 'read' | 'update' | 'delete';
}

/**
 * Parse AppContext and extract CRUD methods
 */
export function parseAppContext(filePath: string): CRUDMethod[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const crudMethods: CRUDMethod[] = [];

  function visit(node: ts.Node) {
    // Look for interface declarations (AppContextType)
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'AppContextType') {
      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name && member.type) {
          const methodName = member.name.getText(sourceFile);
          const methodType = member.type.getText(sourceFile);

          // Determine operation type and entity
          let operation: 'create' | 'read' | 'update' | 'delete' | null = null;
          let entity = '';

          if (methodName.startsWith('add')) {
            operation = 'create';
            entity = methodName.substring(3);
          } else if (methodName.startsWith('update')) {
            operation = 'update';
            entity = methodName.substring(6);
          } else if (methodName.startsWith('delete')) {
            operation = 'delete';
            entity = methodName.substring(6);
          }

          if (operation) {
            crudMethods.push({
              name: methodName,
              signature: `${methodName}: ${methodType}`,
              entity,
              operation,
            });
          }
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return crudMethods;
}

/**
 * Group CRUD methods by entity
 */
export function groupCRUDMethodsByEntity(methods: CRUDMethod[]): Map<string, CRUDMethod[]> {
  const grouped = new Map<string, CRUDMethod[]>();

  for (const method of methods) {
    if (!grouped.has(method.entity)) {
      grouped.set(method.entity, []);
    }
    grouped.get(method.entity)!.push(method);
  }

  return grouped;
}
