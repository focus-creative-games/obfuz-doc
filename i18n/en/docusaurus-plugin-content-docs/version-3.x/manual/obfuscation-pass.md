# Obfuscation Pass

Obfuz supports multiple obfuscation algorithms. During obfuscation, each obfuscation algorithm is executed sequentially in a specific order, ultimately outputting the obfuscated assemblies. Since these obfuscation algorithms are executed in passes, we call them **Obfuscation Passes**.

## Execution Method

The execution method of Obfuz's obfuscation (or encryption) process is to first determine whether this Pass is enabled for the target, then implement the obfuscation and encryption operations of that Pass. Therefore:

- If a certain Obfuscation Pass is disabled for a target, obfuscation will not take effect even if obfuscation is enabled for that target in the Pass's rule files.
- If a certain Obfuscation Pass is enabled for a target, if obfuscation is disabled for that target in the Pass's rule files, obfuscation will not take effect.
- Only when a certain Obfuscation Pass is enabled for the target and obfuscation is enabled in the Pass's rule files will obfuscation take effect.

:::warning

The only exception is fields marked with the `[EncryptField]` attribute, which will ignore Obfuscation Pass rules and `[ObfuzIgnore]`. For detailed documentation, see [Field Encryption](./field-encryption).

:::

## Supported Passes

Currently supported Obfuscation Passes include:

- Symbol Obfuscation
- Const Encryption
- Remove Const Field
- Eval Stack Obfuscation (local and temporary variable obfuscation)
- Expr Obfuscation (expression obfuscation)
- Field Encryption
- Call Obfuscation (function call obfuscation)
- Control Flow Obfuscation
- CleanUp Pass. No obfuscation operations, only cleanup operations (such as optimizing redundant code, etc.).
- RemoveObfuzAttributesPass. The last Pass, removes unused `[ObfuzIgnore]` attributes from the final code.
- Watermark Pass (add watermark)

Obfuscation Passes that will be supported in the future include:

- Anti-Debugger, Anti-Tamper, Anti-Dumping

## Settings

`ObfuzSettings.ObfuscationPassSettings` contains Pass-related settings.

- `EnabledPass` sets the combination of globally enabled Passes. **Passes that are not enabled will be ignored even if set in rule files**.
- `RuleFiles` contains a list of rule files. The paths of these rule files are relative to the Unity project root directory, such as `Assets/Obfuz/pass.xml`.

If no rule files are configured in RuleFiles, by default all Passes enabled in `EnabledPasses` will be executed on all obfuscated assemblies, types, fields, functions, Properties, and events.

Obfuz has already considered Unity's specifics and has automatically disabled obfuscation for cases that cannot be obfuscated (such as not being able to obfuscate MonoBehaviour type names, event functions like Awake, and serialized field names). Generally, no special settings are needed.

## Rule Files

Rule files are supported for fine-grained control of obfuscation and encryption scope.

Rule file format is as follows:

- Top-level tag must be `obfuz`
- Second-level tags must be `assembly`, can have multiple. The name attribute must be an obfuscated assembly, i.e., must appear in `AssemblySettings.AssemblyToObfuscate`. Duplicate assembly rules with the same name are not allowed, meaning at most one assembly rule can be specified for each obfuscated assembly. If no assembly rule is configured for a certain obfuscated assembly, all Passes enabled in `EnabledPass` are used.
- Assembly can only configure type rules
- Type can only configure field, method, event, property rules. The name attribute is optional. If not configured, it applies to all types in the assembly. If configured, it can be a wildcard string expression (note! not a regular expression). Nested types use `/` to separate the declaring type and enclosed subtype, like `test.ClassA/ClassB`.
- Field is a leaf node rule and cannot nest sub-rules. The name attribute matches all when empty, and is a wildcard string expression when non-empty.
- Method is a leaf node rule and cannot nest sub-rules. The name attribute matches all when empty, and is a wildcard string expression when non-empty.
- Property is a leaf node rule and cannot nest sub-rules. The name attribute matches all when empty, and is a wildcard string expression when non-empty.
- Event is a leaf node rule and cannot nest sub-rules. The name attribute matches all when empty, and is a wildcard string expression when non-empty.
- Assembly, type, field, method, property, event can all specify enabled or disabled Obfuscation Passes through enable and disable attributes.

Example:

```xml
<obfuz>
    
    <assembly name="Obfus1" enable="SymbolObfus">
      <type name="TestSetEnablePass1" enable="ConstEncrypt">
        <field name="xxx" enable="ConstEncrypt|FieldEncrypt"/>
        <field name="*abc" enable="+ConstEncrypt"/>
        <method name="Get*" disable="ConstEncrypt"/>
        <property name="Value*" disable="+SymbolObfus|FieldEncrypt"/>
      <type>
      <type name="*.TestAddEnablePass1" enable="+ConstEncrypt">
        <field name="yyy" enable="ConstEncrypt|FieldEncrypt"/>
      </type>
    </assembly>

    <assembly name="Obfus2" enable="SymbolObfus">
      <type enable="ConstEncrypt">
        <field name="xxx" enable="ConstEncrypt|FieldEncrypt"/>
        <field name="*abc" enable="+ConstEncrypt"/>
      <type>
    </assembly>
</obfuz>

```

### enable and disable

The enable and disable attributes are used to set which Passes to enable or disable in the current rule.

Configuration format is `"{+}(PASS_NAME1|PASS_NAME2...){|(PASS_NAME1|PASS_NAME2...)}..."`.

- If the value starts with `+`, it means incremental modification on the passes enabled by the parent node.
- If it doesn't start with `+`, it means enabling or disabling certain Passes based on the value of `ObfuscationPassSettings.EnabledPasses`.
- PASS_NAME values can be `ConstEncrypt, RemoveConstField, FieldEncrypt, SymbolObfus, CallObfus, ExprObfus, ControlFlowObfus, EvalStackObfus` and other Pass types. See the `Obfuz.ObfusPasses.ObfuscationPassType` class definition for details.

For example, assuming EnabledPass=`SymbolObfus|ConstEncrypt|FieldEncrypt`, using the following configuration:

```xml
    <assembly name="Obfus2" enable="SymbolObfus">
      <type name="Hello" enable="+ConstEncrypt">
        <field name="xxx" enable="FieldEncrypt"/>
        <field name="abc" disable="+ConstEncrypt"/>
        <field name="edf" disable="ConstEncrypt"/>
        <field name="aaa" enable="+FieldEncrypt|CallObfus" disable="+ConstEncrypt|SymbolObfus"/>
      <type>
    </assembly>
```

The final effect is:

- For assembly Obfus2 and all its child types and member metadata, only SymbolObfus is enabled by default
- Type Hello added `ConstEncrypt` Pass based on the passes enabled by parent node Obfus2, final Pass is `SymbolObfus|ConstEncrypt`.
- Field xxx only enabled `FieldEncrypt` Pass
- Field abc disabled `ConstEncrypt` Pass based on parent node, its final Pass is `SymbolObfus`.
- Field edf disabled `ConstEncrypt` Pass based on `EnabledPasses`, its final Pass is `SymbolObfus|FieldEncrypt|CallObfus`
- Field aaa added `FieldEncrypt|CallObfus` and disabled `ConstEncrypt|SymbolObfus` based on parent node, its final Pass is `FieldEncrypt|CallObfus`
