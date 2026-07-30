import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("components");
const excluded = new Set(["control-detail", "development", "documentation"]);
const delegatedTriggers = new Map([
  ["ApplicationHeader/ApplicationHeader.tsx", "Create trigger delegates selection to DropdownMenu."],
  ["MoreActionsMenu/MoreActionsMenu.tsx", "Trigger delegates selection to DropdownMenu."],
  ["NoteComposer/NoteComposer.tsx", "Trigger delegates selection to EmojiPicker."],
  ["NotesActivity/NotesActivity.tsx", "Trigger delegates selection to EmojiPicker."],
  ["UserProfileWidget/UserProfileWidget.tsx", "Trigger delegates selection to DropdownMenu."],
]);
const delegatedComponentActions = new Map([
  ["CrmWorkspaceLab/CrmWorkspaceLab.tsx:RowOpenButton", "RowOpenButton requires and invokes onOpen."],
  ["MoreActionsMenu/MoreActionsMenu.tsx:Button", "Button is cloned by DropdownMenu and receives its trigger handler."],
  ["fields/RichTextField/RichTextField.tsx:ColorButton", "ColorButton dispatches an editor command that reaches onChange."],
]);

function collectFiles(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(target, output);
    else if (target.endsWith(".tsx")) output.push(target);
  }
  return output;
}

function attributeName(attribute) {
  return ts.isJsxAttribute(attribute) ? attribute.name.text : "";
}

const failures = [];
let actionableButtons = 0;
let delegatedButtons = 0;
let actionableComponents = 0;

for (const file of collectFiles(root)) {
  const sourceText = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const relative = path.relative(root, file);

  function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const tagName = opening.tagName.getText(source);
      if (tagName === "button") {
        const names = opening.attributes.properties.map(attributeName);
        const typeAttribute = opening.attributes.properties.find(
          (attribute) => attributeName(attribute) === "type",
        );
        const typeValue =
          typeAttribute && ts.isJsxAttribute(typeAttribute) && typeAttribute.initializer
            && ts.isStringLiteral(typeAttribute.initializer)
            ? typeAttribute.initializer.text
            : "";
        const hasAction =
          names.some((name) => ["onClick", "onPointerDown", "onKeyDown"].includes(String(name)))
          || opening.attributes.properties.some(ts.isJsxSpreadAttribute)
          || typeValue === "submit"
          || typeValue === "reset";

        if (hasAction) {
          actionableButtons += 1;
        } else if (delegatedTriggers.has(relative)) {
          delegatedButtons += 1;
        } else {
          const position = source.getLineAndCharacterOfPosition(opening.getStart(source));
          failures.push(`${relative}:${position.line + 1}`);
        }
      } else if (tagName.endsWith("Button")) {
        const names = opening.attributes.properties.map(attributeName);
        const hasAction =
          names.some((name) =>
            ["onClick", "onPress", "onSelect", "onActionSelect", "onOpenChange"].includes(String(name)),
          )
          || opening.attributes.properties.some(ts.isJsxSpreadAttribute);
        const delegated = delegatedComponentActions.has(`${relative}:${tagName}`);

        if (hasAction || delegated) {
          actionableComponents += 1;
        } else {
          const position = source.getLineAndCharacterOfPosition(opening.getStart(source));
          failures.push(`${relative}:${position.line + 1} (${tagName})`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
}

if (failures.length) {
  console.error("Buttons without an action handler or an approved delegated trigger:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Component action audit passed: ${actionableButtons} direct buttons and `
      + `${delegatedButtons} delegated triggers, plus ${actionableComponents} shared button actions.`,
  );
}

const previewSource = fs.readFileSync(
  path.join(root, "control-detail", "ControlDetail", "ControlPreview.tsx"),
  "utf8",
);
const previewStyles = fs.readFileSync(
  path.join(root, "control-detail", "ControlDetail", "ControlDetail.module.css"),
  "utf8",
);
const componentWaitingSources = collectFiles(root).filter((file) => {
  if (file.endsWith(path.join("control-detail", "ControlDetail", "ControlPreview.tsx"))) return false;
  return fs.readFileSync(file, "utf8").includes("Waiting for action");
});

if (
  componentWaitingSources.length
  || !previewSource.includes("className={styles.globalActionPreview}")
  || !previewSource.includes("className={styles.globalActionStatus}")
  || !previewStyles.includes(".globalActionPreview .dialogResult{display:none}")
) {
  console.error("Action status contract failed: expected one outer preview status and no component-owned status.");
  componentWaitingSources.forEach((file) =>
    console.error(`- Component-owned status: ${path.relative(root, file)}`),
  );
  process.exitCode = 1;
}
