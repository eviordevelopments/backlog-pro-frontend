import * as ts from 'typescript';
import * as fs from 'fs';

export interface RouteInfo {
  path: string;
  component: string;
  isLayout?: boolean;
}

/**
 * Parse App.tsx and extract route definitions
 */
export function parseRoutes(filePath: string): RouteInfo[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const routes: RouteInfo[] = [];

  function extractJSXAttribute(element: ts.JsxOpeningLikeElement, attrName: string): string | undefined {
    if (!element.attributes) return undefined;

    for (const attr of element.attributes.properties) {
      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name) && attr.name.text === attrName) {
        if (attr.initializer && ts.isStringLiteral(attr.initializer)) {
          return attr.initializer.text;
        }
        if (attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
          return attr.initializer.expression.getText(sourceFile);
        }
      }
    }
    return undefined;
  }

  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(sourceFile)
        : node.tagName.getText(sourceFile);

      if (tagName === 'Route') {
        const element = ts.isJsxElement(node) ? node.openingElement : node;
        const path = extractJSXAttribute(element, 'path');
        const elementAttr = extractJSXAttribute(element, 'element');

        if (path && elementAttr) {
          // Extract component name from JSX expression like <Dashboard />
          const componentMatch = elementAttr.match(/<(\w+)/);
          const component = componentMatch ? componentMatch[1] : elementAttr;

          routes.push({
            path,
            component,
            isLayout: false,
          });
        } else if (elementAttr && !path) {
          // This is a layout route
          const componentMatch = elementAttr.match(/<(\w+)/);
          const component = componentMatch ? componentMatch[1] : elementAttr;
          
          routes.push({
            path: '/',
            component,
            isLayout: true,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return routes;
}

/**
 * Get all non-layout routes
 */
export function getNonLayoutRoutes(routes: RouteInfo[]): RouteInfo[] {
  return routes.filter(route => !route.isLayout);
}
