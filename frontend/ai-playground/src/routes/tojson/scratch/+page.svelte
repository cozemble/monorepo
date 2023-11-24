<script lang="ts">
    import type {AwsOcrResponse} from "../../aws-ocr/awsOcrTypes";
    import {jsonToHtml, type WordClass} from "../../fromDocument/jsonToHtml";
    import StreamingJson from "../StreamingJson.svelte";
    import type {LabelledKeywordResponse} from "../../genai/sections/labelKeywords/+server";

    const awsResponse: AwsOcrResponse = {
        "json": {
            "pages": [
                {
                    "sections": [],
                    "items": [
                        {
                            "_type": "line",
                            "text": "Green",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.105,
                                "top": 0.082,
                                "width": 0.09,
                                "height": 0.017
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Green Dispose Ltd",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.689,
                                "top": 0.08,
                                "width": 0.153,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Royal House, 11 Main Street",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.609,
                                "top": 0.095,
                                "width": 0.234,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Dispose",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.105,
                                "top": 0.108,
                                "width": 0.122,
                                "height": 0.022
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Bolton",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.791,
                                "top": 0.11,
                                "width": 0.051,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Greater Manchester",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.679,
                                "top": 0.125,
                                "width": 0.164,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "GM1 5RT",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.763,
                                "top": 0.14,
                                "width": 0.079,
                                "height": 0.01
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Telephone: 01455 7769896",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.618,
                                "top": 0.17,
                                "width": 0.224,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Fax: 01454 87753346",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.663,
                                "top": 0.185,
                                "width": 0.179,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Email: sales@greendispose.co.uk",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.565,
                                "top": 0.2,
                                "width": 0.276,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Knight Bank Estates Ltd",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.104,
                                "top": 0.229,
                                "width": 0.196,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "c/o Bob Mortymer",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.104,
                                "top": 0.244,
                                "width": 0.146,
                                "height": 0.013
                            }
                        },
                        {
                            "_type": "line",
                            "text": "76 Alton Castle",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.103,
                                "top": 0.259,
                                "width": 0.125,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "London SE11 6TW",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.104,
                                "top": 0.274,
                                "width": 0.154,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "table",
                            "rows": [
                                {
                                    "_type": "row",
                                    "cells": [
                                        "Invoice No.",
                                        "GD087676"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "Document Date:",
                                        "28/08/2023"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "Ext Document No.",
                                        "EX876754"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "Customer No.",
                                        "C865454"
                                    ]
                                }
                            ],
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.497,
                                "top": 0.3,
                                "width": 0.319,
                                "height": 0.074
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Sales Invoice",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.343,
                                "top": 0.346,
                                "width": 0.137,
                                "height": 0.012
                            }
                        },
                        {
                            "_type": "table",
                            "rows": [
                                {
                                    "_type": "row",
                                    "cells": [
                                        "Date /\nPeriod",
                                        "Quantity",
                                        "Description",
                                        "Job No.",
                                        "Cust.\nOrder\nNo.",
                                        "Unit of\nMeasure",
                                        "Unit\nPrice",
                                        "Amount"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "",
                                        "",
                                        "CTS765766\n76 Deer Lane\n76 Deer Lane\nYork, YS1 5DJ",
                                        "",
                                        "",
                                        "",
                                        "",
                                        ""
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "05/08/2021",
                                        "1",
                                        "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
                                        "JN76665",
                                        "C865454",
                                        "Each",
                                        "13.45",
                                        "13.45"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "04/08/2021",
                                        "1",
                                        "Waste Collection\nFood Waste\n240 litre wheelie bin",
                                        "JN76665",
                                        "C865454",
                                        "Each",
                                        "8.54",
                                        "8.54"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "02/08/2021",
                                        "1",
                                        "Waste Collection\nGlass\n240 litre wheelie bin",
                                        "JN76665",
                                        "C865454",
                                        "Each",
                                        "4.13",
                                        "4.13"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "06/08/2021",
                                        "1",
                                        "Waste Collection\nMixed Recycling\n1100 litre wheelie bin",
                                        "JN76665",
                                        "C865454",
                                        "Each",
                                        "8.92",
                                        "8.92"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "12/08/2021",
                                        "1",
                                        "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
                                        "JN76548",
                                        "C865454",
                                        "Each",
                                        "13.45",
                                        "13.45"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "11/08/2021",
                                        "1",
                                        "Waste Collection\nFood Waste\n240 litre wheelie bin",
                                        "JN76548",
                                        "C865454",
                                        "Each",
                                        "8.54",
                                        "8.54"
                                    ]
                                },
                                {
                                    "_type": "row",
                                    "cells": [
                                        "09/08/2021",
                                        "1",
                                        "Waste Collection\nGlass",
                                        "JN76548",
                                        "C865454",
                                        "Each",
                                        "4.13",
                                        "4.13"
                                    ]
                                }
                            ],
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.098,
                                "top": 0.401,
                                "width": 0.745,
                                "height": 0.447
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Continued",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.391,
                                "top": 0.87,
                                "width": 0.083,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "61.16",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.562,
                                "top": 0.87,
                                "width": 0.046,
                                "height": 0.011
                            }
                        },
                        {
                            "_type": "line",
                            "text": "VAT Registration No: 467 8765 66, Company Registration number: SC777565",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.094,
                                "top": 0.923,
                                "width": 0.627,
                                "height": 0.014
                            }
                        },
                        {
                            "_type": "line",
                            "text": "Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG",
                            "boundingBox": {
                                "_type": "boundingBox",
                                "left": 0.095,
                                "top": 0.941,
                                "width": 0.535,
                                "height": 0.013
                            }
                        }
                    ]
                }
            ]
        },
        "html": ""
    }

    let html = jsonToHtml(awsResponse.json.pages)

    function onKeywordLabellingComplete(event:CustomEvent<string>) {
        console.log("onKeywordLabellingComplete", event.detail)
        const response:LabelledKeywordResponse[] = JSON.parse(event.detail)
        const wordClasses:WordClass[] = response.map(r => ({
            paragraphNumber: r.paragraphNumber,
            word: r.fixedWord,
            clazz: 'fixed-word'
        }))
        const stylePrefix = `<style>
            .fixed-word {
            font-weight: bold;
            }
            </style>`
        html = stylePrefix + jsonToHtml(awsResponse.json.pages, wordClasses)
        console.log({html, wordClasses})
    }
</script>

<div class="flex w-full">
<StreamingJson api="/genai/sections/labelKeywords" body={{html}} on:completion={onKeywordLabellingComplete}/>
</div>
{@html html}
