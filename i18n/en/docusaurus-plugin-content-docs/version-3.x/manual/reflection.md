# Reflection

[Symbol Obfuscation](./symbol-obfuscation) modifies the names of various metadata. This causes reflection lookups for types, functions, fields, etc. by name to fail.
Therefore, without special handling, these functions will not work properly after symbol obfuscation.

## Special Support for Unity Built-in Serialization

Obfuz is deeply integrated with Unity workflows and has built-in support for the following rules:

- Will not obfuscate type names and namespaces of MonoBehaviour, ScriptableObject, and types marked with `[Serializable]` attribute
- Will not obfuscate serialized fields of the above types, including private fields marked with `[SerializedField]` attribute
- Will not obfuscate non-static public properties of the above types, but public static and non-public properties will still be obfuscated
- Will not obfuscate enum item names of enum types marked with `[Serializable]` attribute
- Will not obfuscate event functions with special purposes like `Awake`, `Start` in MonoBehavior

More rules can be found in the documentation [Symbol Obfuscation](./symbol-obfuscation). Types not covered by default rules need to use the special solutions below.

## Offline Detection of Reflection Code Compatibility Issues

Obfuz supports detecting potentially failing code after symbol obfuscation and prints errors or warnings. For detailed documentation, see [Detect Reflection Compatibility](./symbol-obfuscation#detect-reflection-compatibility).

## Runtime Reflection Support

### ObfuscationTypeMapper

Obfuz provides `Obfuz.ObfuscationTypeMapper` to maintain the mapping relationship from original type full names to types before obfuscation. ObfuscationTypeMapper provides the following interfaces:

- `Type GetTypeByOriginalFullName(Assembly assembly, string originalFullName)` Find Type by original type name.
- `string GetOriginalTypeFullName(Type type)` Get the original type full name from Type.
- `string GetOriginalTypeFullNameOrCurrent(Type type)` Get the original type full name from Type. If the type is not found in the registered mapping type dictionary, return the `Type.FullName` value.

### ObfuscationInstincts

Obfuz provides [ObfuscationInstincts](./obfuscation-instincts) to get original type names.

ObfuscationTypeMapper is used to get original type names when you only know the runtime `Type` variable. If you know the specific type at the current location,
ObfuscationInstincts provides a more direct interface to get original type names without needing to register type mappings.

- `FullNameOf<T>` Returns the original type full name
- `NameOf<T>` Returns the original type name without namespace

## Solving the Problem of Reflection Not Finding Types After Obfuscation

### 1. Disable Symbol Obfuscation for Metadata That Needs Reflection Lookup

There are several ways:

1. Configure disabling `Symbol Obfus` Pass for certain metadata in [Obfuscation Pass](./obfuscation-pass).
2. Configure disabling symbol obfuscation for certain metadata in the rule files of [Symbol Obfuscation](./symbol-obfuscation).
3. Add `[ObfuzIgnore]` attribute to metadata that needs to disable symbol obfuscation in code, see documentation [Obfuz CustomAttributes](./customattributes).

### 2. Use ObfuscationTypeMapper to Get Obfuscated Types by Original Class Names

Obfuz provides `Obfuz.ObfuscationTypeMapper` to maintain the mapping relationship from original type full names to types before obfuscation. Usage:

- Call `ObfuscationInstincts.RegisterReflectionType<T>()` at startup to register types that need reflection lookup
- Call `ObfuscationTypeMapper.GetTypeByOriginalFullName(assembly, originalFullName)` function to get types by original names

Example code:

```csharp

// Type that needs reflection lookup
class MyClassA
{

}

// Type that needs reflection lookup
class MyClassB
{

}

class MyClass
{
  void OnInit()
  {
    // Register this mapping relationship at startup, must complete registration before calling ObfuscationTypeMapper.GetTypeByOriginalFullName
    ObfuscationInstincts.RegisterReflectionType<MyClassA>();
    ObfuscationInstincts.RegisterReflectionType<MyClassB>();
    // ..
  }

  void Test()
  {
    // ObfuscationTypeMapper.GetTypeByOriginalFullName needs assembly parameter to indicate
    // which assembly to search for this type
    Assembly ass = typeof(MyClass).Assembly;
    var typeA = ObfuscationTypeMapper.GetTypeByOriginalFullName(ass, "MyClassA");
    // ...
  }
}


```

### 3. Manually Maintain Mapping Between Original Names and Types

Use code similar to the following:

```csharp

class NotReflectionFind
{
  private static readonly Dictionary<string, Type> _types = new Dictionary<string, Type>{
    {"A", typeof(A)},
    {"B", typeof(B)},
    // ...

  };

  public static Type FindType(string name)
  {
    return _types.TryGetValue(name, out var type) ? type : null;
  }
}


```
