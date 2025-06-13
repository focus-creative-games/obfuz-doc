# 反射

[符号混淆](./symbol-obfuscation)会修改各种元数据的名称。这使得通过名称去反射查找类型、函数、字段等信息会失败。
因此如果没有特殊处理，符号混淆后这些功能都会无法正常工作。

## 对Unity内置序列化功能的特殊支持

Obfuz与Unity工作流深度集成，已经内置了以下规则：

- 不会混淆MonoBehaviour、ScriptableObject及标注了`[Serialiable]`特性的类型的类型名、命名空间
- 不会混淆以上类型的参与序列化的字段，包括标注了`[SerializedField]`特性的私有字段
- 不会混淆以上类型的非static public属性，但public static及非public的属性仍然会被混淆
- 不会混淆标注了`[Serialiable]`特性的枚举类型的枚举项名
- 不会混淆MonoBehavior中`Awake`、`Start`之类的有特殊用途的事件函数

更多的规则可查看文档[符号混淆](./symbol-obfuscation)。不在默认规则内的类型需要使用下面的特殊的解决办法。

## 运行时反射相关支持

### ObfuscationTypeMapper

Obfuz提供了`Obfuz.ObfuscationTypeMapper`维护混淆前类型全名到类型的映射关系，ObfuscationTypeMapper提供了以下接口：

- `Type GetTypeByOriginalFullName(Assembly assembly, string originalFullName)` 根据原始类型名查找它的Type。
- `string GetOriginalTypeFullName(Type type)` 根据Type获得它的原始类型全名。
- `string GetOriginalTypeFullNameOrCurrent(Type type)` 根据Type获得它的原始类型全名，如果在注册的映射类型字典中找不到该类型，则返回类型的`Type.FullName`值。

### ObfuscationInstincts

Obfuz提供了[ObfuscationInstincts](./obfuscation-instincts)用于获取原始类型名。

ObfuscationTypeMapper用于只知道运行时`Type`变量的情况下获得原始类型名，如果当前位置知道是哪个具体类型，
ObfuscationInstincts提供了更直接的接口获取原始类型名，并不需要注册类型映射。

- `FullNameOf<T>` 返回类型的原始类型命名
- `NameOf<T>` 返回类型的原始类型名，不含命名空间

## 解决混淆后反射找不到类型的问题

### 1. 对需要反射查找的元数据禁用符号混淆

有几种方式：

1. [Obfuscation Pass](./obfuscation-pass)中配置对某些元数据禁用`Symbol Obfus` Pass。
2. [符号混淆](./symbol-obfuscation)的规则文件中配置对某些元数据禁用符号混淆。
3. 在代码中给需要禁用符号混淆的元数据上添加`[ObfuzIgnore]`特性， 文档[Obfuz CustomAttributes](./customattributes)。

### 2. 使用ObfuscationTypeMapper根据原始类名获取混淆后的类型

Obufz提供了`Obfuz.ObfuscationTypeMapper`维护混淆前类型全名到类型的映射关系。使用方式如下：

- 启动时调用`ObfuscationInstincts.ObfuscationInstincts<T>()`注册需要反射查找的类型
- 调用`ObfuscationTypeMapper.GetTypeByOriginalFullName(assembly, originalFullName)`函数根据原始名获得类型

示例代码如下：

```csharp

// 需要反射查找的类型
class MyClassA
{

}

// 需要反射查找的类型
class MyClassB
{

}

class MyClass
{
  void OnInit()
  {
    // 启动时注册这个映射关系，需要在调用ObfuscationTypeMapper.GetTypeByOriginalFullName前完成注册
    ObfuscationInstincts.RegisterReflectionType<MyClassA>();
    ObfuscationInstincts.RegisterReflectionType<MyClassB>();
    // ..
  }

  void Test()
  {
    // ObfuscationTypeMapper.GetTypeByOriginalFullName需要传入assembly参数，表示从
    // 该assembly查找此类型
    Assembly ass = typeof(MyClass).Assembly;
    var typeA = ObfuscationTypeMapper.GetTypeByOriginalFullName(ass, "MyClassA");
    // ...
  }
}


```

### 3. 手动维护原始名称与类型的映射关系

使用类似下面的代码：

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
