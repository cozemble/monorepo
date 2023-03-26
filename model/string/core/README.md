# Adding a property to Cozemble

Cozemble uses "Models" to allow users to represent domain concepts like Customer, Invoice etc.
A Model contains Properties that represent the attributes of the domain concept.
For example, a Customer Model has properties like Name, Address, Phone etc.

Cozemble models have no idea what properties are registered in the system. It doesn't even have basic types
like `string` or `number`.
There is a central registry called `propertyDescriptors` that contains all the properties that are registered in the
system.
A call to `propertyDescriptors.register(<propertyDescriptor>)` is all that is required to register a property. That
means that a property
descriptor must describe everything about the property, so it can plug into Cozemble. You will find
the `PropertyDescriptor` in `@cozemble/model-core` package.

So our goal is to make a property descriptor. We will make a property that represents a string. A `PropertyDescriptor`
is a generic type that takes two parameters.
The first parameter is the type of the property. The second parameter is the type of the value that is stored in the
database. We know the type that will be
stored in the database is `string | null`. So out starting point is to define the property type.

## 1. Define the string property type

Read the comments and code in the file [`./src/stringProperty.ts`](./src/stringProperty.ts) to understand how to define
a property.

## 2. Define the string property descriptor

First of all, take a read of the comments and code in the `PropertyDescriptor` type in the `@cozemble/model-core`
package.

Now read the comments and code in the file [`./src/stringPropertyDescriptor.ts`](./src/stringPropertyDescriptor.ts) to
understand how to define a property descriptor.

## 3. Define string property events

Because properties are configured in cozemble using event sourcing, all edits to properties must be via events,
including
the creation of the property. Also, because the cozemble runtime has no knowledge of properties, it also has no
knowledge of
their associated events. So in the same way as property types need to be registered with the cozemble runtime, so do
their
associated events. This is done by registering the events with the `modelEventDescriptors` registry.

Take a read through the comments and code in the file [`./src/events.ts`](./src/events.ts) to understand how to define a
property descriptor.

## 4. Export everything important about the property, and register it

See the comments and code in the file [`./src/index.ts`](./src/index.ts) to understand how to export everything

## 5. Create the UI components to configure and use the property

In general, we need three UI components to make use of this new property:

1. A component to configure the property when it is being added to a model. This would include things like the regex
   validations etc
2. A component to display values in the data editor.
3. A component to edit values displayed in the data editor. For example, a string property would have a text box to edit
   the value, but a date property might have a date picker

Those components for string are in the `@cozemble/model-string-ui` package.