# Architecture Decision Record (ADR) Template

## Title

ADR-001: Adopting JSON Schema as the underlying data modeling approach

## Status

Proposed

## Context

Our project is aimed at developing an extensible data editing platform, which requires a robust and scalable data modeling approach. JSON Schema is one of the considered options as it is a well-recognized standard for defining the structure of JSON data. Adopting JSON Schema has the potential to provide interoperability with a large ecosystem.

However, our existing data modeling approach is based on abstract slots, where each slot has an ID and a name. This approach inherently supports data refactoring since the slots can be renamed while their IDs remain constant.

The objective of this ADR is to evaluate whether JSON Schema should be adopted as the core data modeling approach for our extensible data editing platform.

## Decision Drivers

1. **Interoperability**: JSON Schema is a standard with a large ecosystem and can potentially increase interoperability with other systems.
2. **Extensibility**: The approach should be able to support future extensions and modifications.
3. **Refactoring Support**: The ability to refactor data models with minimal impact on existing data is critical.
4. **Complexity and Learning Curve**: The chosen approach should not be excessively complex or have a steep learning curve for the development team.

## Considered Options

1. Adopt JSON Schema as the core data modeling approach.
2. Continue using the abstract slots based data modeling approach.
3. Hybrid approach combining JSON Schema for slot type definitions,  and abstract model slots for data modeling.

## Pros and Cons of the Options

### Option 1: Adopt JSON Schema

* **Pros**:
    * Standard-based approach that promotes interoperability.
    * Supports validation and documentation of JSON data structures.
    * Rich ecosystem with libraries and tools.
* **Cons**:
    * Lacks inherent support for refactoring based on slot IDs.
    * Is quite limited as a schema language, having no support for, for example, unique properties.
    * Expressing bi-directional relationships between entities is not straightforward.

### Option 2: Continue using abstract slots based data modeling approach

* **Pros**:
    * Supports easy data refactoring by using slot IDs.
    * Does not limit us in terms of what we want to model (uniqueness, bi-directional relationships, and stuff we currently don't know about)
    * May be simpler and more intuitive for certain use cases.
* **Cons**:
    * Lacks the broad interoperability that comes with a widely recognized standard.
    * May not have the same level of tooling and library support as JSON Schema.

### Option 3: Hybrid approach combining JSON Schema and abstract slots

* **Pros**:
    * Combines the interoperability of JSON Schema with the refactoring support of the abstract slots approach.
    * Could leverage existing tooling for both approaches.
* **Cons**:
    * Potentially more complex to implement and maintain.
    * The hybrid nature may introduce unexpected challenges or limitations.

## Decision Outcome

Adopt option 3: Hybrid approach combining JSON Schema and abstract slots.  We will use cozemble models to collect slots and add modelling capabilities not available in JSON Schema.  
We will make it possible to define slot types (properties) using json schema, to define configuration options and "micro schemas" to data stored in each slot.

## Consequences

## Links
