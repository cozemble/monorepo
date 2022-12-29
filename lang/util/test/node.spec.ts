import {mandatory} from "../src";

interface Node<T = any, C = any> {
    _type: "node",
    id: string | number
    value: T
    children: Node<C>[]
}

function node(id: string | number, value: any, children: Node[] = []): Node {
    return {_type: "node", id, value, children}
}

const deliveryDocketData: Node = {
    _type: "node",
    id: "docket#1",
    value: [
        node("orderNumber", 4099),
        node("deliveryDate", "14/09/2022"),
        node("customer", [
            node("firstName", "Mike"),
            node("lastName", "Hogan"),
            node("email", "mike@email.com")]),
        node("deliveryAddress", [
            node("line1", "Flat 6"),
            node("line2", "Sworders Court"),
            node("postcode", "CM23 XX1"),
            node("country", "UK"),
        ])],
    children: [
        node("products", [
            node(0, [
                node("product", [
                    node("code", "DDL-0001"),
                    node("name", "Dulce de Leche original")]),
                node("quantity", 96),
            ], [node("batches", [
                node(0, [
                    node("uniqueCode", "231221A"),
                    node("unitOfMeasure", "12KG"),
                    node("bestBeforeData", "14/09/2022"),
                ]), node(1, [
                    node("uniqueCode", "87765F"),
                    node("unitOfMeasure", "1.5KG"),
                    node("bestBeforeData", "01/01/1970"),
                ]), node(2, [
                    node("uniqueCode", "23478G"),
                    node("unitOfMeasure", "1KG"),
                    node("bestBeforeData", "01/01/1970"),
                ])])]),
            node(1, [
                node("product", [
                    node("code", "LXL-0B12"),
                    node("name", "Luxury Salter")]),
                node("quantity", 118),
            ], [node("batches", [
                node(0, [
                    node("uniqueCode", "879764X"),
                    node("unitOfMeasure", "6KG"),
                    node("bestBeforeData", "14/09/2022"),
                ])])])]),
        node("documents", [
            node("invoice", 3433),
            node("customsForm", "Document generator")])
    ]
}

interface AutoNumberType {
    _type: "autonumber.type"
}

interface StringType {
    _type: "string.type"
}

interface NumberType {
    _type: "number.type"
}

interface DateType {
    _type: "date.type"
}

interface LinkType {
    _type: "link.type"
    modelId: string
}

interface InlineType {
    _type: "inline.type"
    modelId: string
}

function autonumberType(): AutoNumberType {
    return {_type: "autonumber.type"}
}

function dateType(): DateType {
    return {_type: "date.type"}
}

function stringType(): StringType {
    return {_type: "string.type"}
}

function numberType(): NumberType {
    return {_type: "number.type"}
}

function linkType(modelId: string): LinkType {
    return {_type: "link.type", modelId}
}

function inlineType(modelId: string): InlineType {
    return {_type: "inline.type", modelId}
}

type ModelElementType = AutoNumberType | DateType | LinkType | InlineType | StringType | NumberType


const customerModel: Node = {
    _type: "node",
    id: "customerModel",
    value: [
        node("firstName", stringType()),
        node("lastName", stringType()),
        node("email", stringType())],
    children: []
}

const addressModel: Node = {
    _type: "node",
    id: "addressModel",
    value: [
        node("line1", stringType()),
        node("line2", stringType()),
        node("postcode", stringType()),
        node("country", stringType())],
    children: []
}

const productDefinitionModel: Node = {
    _type: "node",
    id: "productDefinitionModel",
    value: [
        node("code", stringType()),
        node("name", stringType())],
    children: []
}

const batchModel = node("batchModel", [
    node("uniqueCode", stringType()),
    node("unitOfMeasure", stringType()),
    node("bestBeforeData", dateType()),
    node("manufactureTime", stringType()),
    node("manufactureAddress", inlineType(addressModel.id.toString())),
])

const productModel = node("productModel", [
    node("product", linkType(productDefinitionModel.id.toString())),
    node("quantity", numberType())
], [
    node("batches", relatedModel("many", batchModel.id.toString()))])


interface RelatedModel {
    _type: "related.model"
    relationshipType: "included"
    cardinality: "one" | "many"
    modelId: string
}

function relatedModel(cardinality: "one" | "many", modelId: string): RelatedModel {
    return {_type: "related.model", relationshipType: "included", cardinality, modelId}
}

type ModelDefinition = Node<Node[], RelatedModel>

const documentsModel: ModelDefinition = node("documentsModel", [
    node("invoice", numberType()),
    node("customsForm", numberType())])

const deliveryDocketModel: ModelDefinition = {
    _type: "node",
    id: "docketModel",
    value: [
        node("orderNumber", autonumberType()),
        node("deliveryDate", dateType()),
        node("customer", linkType(customerModel.id.toString())),
        node("deliveryAddress", inlineType(addressModel.id.toString()))],
    children: [
        node("products", relatedModel("many", productModel.id.toString())),
        node("documents", relatedModel("one", documentsModel.id.toString()))
    ]
}

function findPropertyDefinition(model: Node<Node[]>, dataNode: Node): Node {
    return mandatory(model.value.find(p => p.id === dataNode.id), `No property in model ${model.id} with id ${dataNode.id}`)
}

function findModel(allModels: Node[], modelId: string): ModelDefinition {
    return mandatory(allModels.find(m => m.id === modelId), `No model with id ${modelId}`)
}

function matchChildDataToModel(allModels: Node[], model: ModelDefinition, child: Node): Node {
    // const childModel = findModel(allModels, child.id.toString())
    const childDefinition = mandatory(model.children.find(ch => ch.id === child.id), `No related model definition for id ${child.id} in model ${model.id}`)
    // const childModel = findModel(allModels, childDefinition.value.modelId);
    // const matched = (child.value as Node[]).map(data => matchModelToData(allModels, childModel, data))
    return child
}

function matchModelToData(allModels: Node[], model: Node, data: Node): Node {
    let result = node("model", [], [])
    if (Array.isArray(data.value)) {
        const properties = data.value.map(n => {
            const propertyNode = findPropertyDefinition(model, n)
            const propertyType = propertyNode.value as ModelElementType
            if (propertyType._type === "link.type" || propertyType._type === "inline.type") {
                const referencedModel = findModel(allModels, propertyType.modelId)
                return {...matchModelToData(allModels, referencedModel, n), id: referencedModel.id}
            } else {
                return propertyNode
            }
        })
        result = {...result, value: properties}
    }
    result = {...result, children: data.children.map(c => matchChildDataToModel(allModels, model, c))}
    return result
}

test("match model to data", () => {
    const allModels = [deliveryDocketModel, customerModel, addressModel, productDefinitionModel, productModel, batchModel]
    const flattenedModel = matchModelToData(allModels, deliveryDocketModel, deliveryDocketData)
    console.log({flattenedModel})
})