import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface InterfaceInfo {
  name: string;
  fields: FieldInfo[];
  filePath: string;
}

export interface FieldInfo {
  name: string;
  type: string;
  optional: boolean;
  isRelationship: boolean;
}

export interface TypeAliasInfo {
  name: string;
  type: string;
  filePath: string;
}

/**
 * Parse TypeScript files and extract interface definitions
 */
export function parseTypeScriptFile(filePath: string): {
  interfaces: InterfaceInfo[];
  typeAliases: TypeAliasInfo[];
} {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const interfaces: InterfaceInfo[] = [];
  const typeAliases: TypeAliasInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name) {
      const interfaceInfo: InterfaceInfo = {
        name: node.name.text,
        fields: [],
        filePath,
      };

      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const fieldName = member.name.getText(sourceFile);
          const fieldType = member.type ? member.type.getText(sourceFile) : 'any';
          const optional = !!member.questionToken;
          const isRelationship = fieldName.endsWith('Id') || fieldName.includes('Ref');

          interfaceInfo.fields.push({
            name: fieldName,
            type: fieldType,
            optional,
            isRelationship,
          });
        }
      });

      interfaces.push(interfaceInfo);
    }

    if (ts.isTypeAliasDeclaration(node) && node.name) {
      typeAliases.push({
        name: node.name.text,
        type: node.type.getText(sourceFile),
        filePath,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { interfaces, typeAliases };
}

/**
 * Extract all interfaces from a directory
 */
export function extractInterfacesFromDirectory(dirPath: string): InterfaceInfo[] {
  const interfaces: InterfaceInfo[] = [];
  
  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const result = parseTypeScriptFile(filePath);
        interfaces.push(...result.interfaces);
      }
    }
  }
  
  walkDir(dirPath);
  return interfaces;
}

/**
 * Get all relationship fields from interfaces
 */
export function getRelationshipFields(interfaces: InterfaceInfo[]): Array<{
  interfaceName: string;
  fieldName: string;
  fieldType: string;
}> {
  const relationships: Array<{
    interfaceName: string;
    fieldName: string;
    fieldType: string;
  }> = [];

  for (const iface of interfaces) {
    for (const field of iface.fields) {
      if (field.isRelationship) {
        relationships.push({
          interfaceName: iface.name,
          fieldName: field.name,
          fieldType: field.type,
        });
      }
    }
  }

  return relationships;
}
