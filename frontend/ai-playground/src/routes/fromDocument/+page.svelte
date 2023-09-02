<script lang="ts">
    import {goto} from "$app/navigation";
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import PostOcr from "./PostOcr.svelte";

    let errorMessage: string | null = null
    let file: File | null = null;
    // let awsOcrResponse: AwsOcrResponse  = {
    //     "json": {
    //         "pages": [
    //             {
    //                 "items": [
    //                     {
    //                         "_type": "line",
    //                         "text": "Green"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Green Dispose Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Royal House, 11 Main Street"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Dispose"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Bolton"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Greater Manchester"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "GM1 5RT"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Telephone: 01455 7769896"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Fax: 01454 87753346"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Email: sales@greendispose.co.uk"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Knight Bank Estates Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "c/o Bob Mortymer"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "76 Alton Castle"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "London SE11 6TW"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Invoice No.",
    //                                     "GD087676"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Document Date:",
    //                                     "28/08/2023"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Ext Document No.",
    //                                     "EX876754"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Customer No.",
    //                                     "C865454"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Sales Invoice"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Date /\nPeriod",
    //                                     "Quantity",
    //                                     "Description",
    //                                     "Job No.",
    //                                     "Cust.\nOrder\nNo.",
    //                                     "Unit of\nMeasure",
    //                                     "Unit\nPrice",
    //                                     "Amount"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "",
    //                                     "",
    //                                     "CTS765766\n76 Deer Lane\n76 Deer Lane\nYork, YS1 5DJ",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     ""
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "05/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
    //                                     "JN76665",
    //                                     "C865454",
    //                                     "Each",
    //                                     "13.45",
    //                                     "13.45"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "04/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nFood Waste\n240 litre wheelie bin",
    //                                     "JN76665",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.54",
    //                                     "8.54"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "02/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGlass\n240 litre wheelie bin",
    //                                     "JN76665",
    //                                     "C865454",
    //                                     "Each",
    //                                     "4.13",
    //                                     "4.13"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "06/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nMixed Recycling\n1100 litre wheelie bin",
    //                                     "JN76665",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.92",
    //                                     "8.92"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "12/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
    //                                     "JN76548",
    //                                     "C865454",
    //                                     "Each",
    //                                     "13.45",
    //                                     "13.45"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "11/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nFood Waste\n240 litre wheelie bin",
    //                                     "JN76548",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.54",
    //                                     "8.54"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "09/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGlass",
    //                                     "JN76548",
    //                                     "C865454",
    //                                     "Each",
    //                                     "4.13",
    //                                     "4.13"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Continued"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "61.16"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "VAT Registration No: 467 8765 66, Company Registration number: SC777565"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG"
    //                     }
    //                 ]
    //             },
    //             {
    //                 "items": [
    //                     {
    //                         "_type": "line",
    //                         "text": "Green"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Green Dispose Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Royal House, 11 Main Street"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Dispose"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Bolton"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Greater Manchester"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "GM1 5RT"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Telephone: 01455 7769896"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Fax: 01454 87753346"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Email: sales@greendispose.co.uk"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Knight Bank Estates Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "c/o Bob Mortymer"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "76 Alton Castle"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "London SE11 6TW"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Invoice No.",
    //                                     "GD087676"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Document Date:",
    //                                     "28/08/2023"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Ext Document No.",
    //                                     "EX876754"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Customer No.",
    //                                     "C865454"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Sales Invoice"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Date /\nPeriod",
    //                                     "Quantity",
    //                                     "Description",
    //                                     "Job No.",
    //                                     "Cust.\nOrder No.",
    //                                     "Unit of\nMeasure",
    //                                     "Unit\nPrice",
    //                                     "Amount"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "",
    //                                     "",
    //                                     "Continued",
    //                                     "61.16",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     ""
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "13/08/2021",
    //                                     "1",
    //                                     "240 litre wheelie bin\nWaste Collection\nMixed Recycling\n1100 litre wheelie bin",
    //                                     "JN76548",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.92",
    //                                     "8.92"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "19/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
    //                                     "JN76545",
    //                                     "C865454",
    //                                     "Each",
    //                                     "13.45",
    //                                     "13.45"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "18/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nFood Waste\n240 litre wheelie bin",
    //                                     "JN76545",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.54",
    //                                     "8.54"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "16/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGlass\n240 litre wheelie bin",
    //                                     "JN76545",
    //                                     "C865454",
    //                                     "Each",
    //                                     "4.13",
    //                                     "4.13"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "20/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nMixed Recycling\n1100 litre wheelie bin",
    //                                     "JN76545",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.92",
    //                                     "8.92"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "August 2021",
    //                                     "1",
    //                                     "Monthly Management Fee",
    //                                     "JN76546",
    //                                     "C865454",
    //                                     "Each",
    //                                     "164.64",
    //                                     "164.64"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "26/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGeneral Waste\n1100 litre wheelie bin",
    //                                     "JN76547",
    //                                     "C865454",
    //                                     "Each",
    //                                     "13.45",
    //                                     "13.45"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "25/08/2021",
    //                                     "1",
    //                                     "Waste Collection",
    //                                     "JN76547",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.54",
    //                                     "8.54"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Continued"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "291.75"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "VAT Registration No: 467 8765 66, Company Registration number: SC777565"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG"
    //                     }
    //                 ]
    //             },
    //             {
    //                 "items": [
    //                     {
    //                         "_type": "line",
    //                         "text": "Green"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Green Dispose Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Royal House, 11 Main Street"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Dispose"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Bolton"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Greater Manchester"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "GM1 5RT"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Telephone: 01455 7769896"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Fax: 01454 87753346"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Email: sales@greendispose.co.uk"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Knight Bank Estates Ltd"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "c/o Bob Mortymer"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "76 Alton Castle"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "London SE11 6TW"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Invoice No.",
    //                                     "GD087676"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Document Date:",
    //                                     "28/08/2023"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Ext Document No.",
    //                                     "EX876754"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Customer No.",
    //                                     "C865454"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Sales Invoice"
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Date /\nPeriod",
    //                                     "Quantity",
    //                                     "Description",
    //                                     "Job No.",
    //                                     "Cust. Unit\nOrder No.",
    //                                     "of\nMeasure",
    //                                     "Unit\nPrice",
    //                                     "Amount"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "",
    //                                     "",
    //                                     "Continued",
    //                                     "291.75",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     ""
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "",
    //                                     "",
    //                                     "Food Waste\n240 litre wheelie bin",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     "",
    //                                     ""
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "23/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGlass\n240 litre wheelie bin",
    //                                     "JN76547",
    //                                     "C865454",
    //                                     "Each",
    //                                     "4.13",
    //                                     "4.13"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "30/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nGlass\n240 litre wheelie bin",
    //                                     "JN76547",
    //                                     "C865454",
    //                                     "Each",
    //                                     "4.13",
    //                                     "4.13"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "27/08/2021",
    //                                     "1",
    //                                     "Waste Collection\nMixed Recycling\n1100 litre wheelie bin",
    //                                     "JN76548",
    //                                     "C865454",
    //                                     "Each",
    //                                     "8.92",
    //                                     "8.92"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Payment terms",
    //                                     "30 days"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Bank Details:",
    //                                     ""
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Account name",
    //                                     "Green Dispose Ltd"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Bank",
    //                                     "Natwest"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Account No.",
    //                                     "87676576"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Sort Code",
    //                                     "01-21-33"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "table",
    //                         "rows": [
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Total GBP",
    //                                     "308.93"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "20% VAT",
    //                                     "61.79"
    //                                 ]
    //                             },
    //                             {
    //                                 "_type": "row",
    //                                 "cells": [
    //                                     "Total GBP Incl Vat",
    //                                     "370.72"
    //                                 ]
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "VAT Registration No: 467 8765 66, Company Registration number: SC777565"
    //                     },
    //                     {
    //                         "_type": "line",
    //                         "text": "Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG"
    //                     }
    //                 ]
    //             }
    //         ]
    //     },
    //     "html": "<p>Green</p><p>Green Dispose Ltd</p><p>Royal House, 11 Main Street</p><p>Dispose</p><p>Bolton</p><p>Greater Manchester</p><p>GM1 5RT</p><p>Telephone: 01455 7769896</p><p>Fax: 01454 87753346</p><p>Email: sales@greendispose.co.uk</p><p>Knight Bank Estates Ltd</p><p>c/o Bob Mortymer</p><p>76 Alton Castle</p><p>London SE11 6TW</p><table><tr><td>Invoice No.</td><td>GD087676</td></tr><tr><td>Document Date:</td><td>28/08/2023</td></tr><tr><td>Ext Document No.</td><td>EX876754</td></tr><tr><td>Customer No.</td><td>C865454</td></tr></table><p>Sales Invoice</p><table><tr><td>Date /\nPeriod</td><td>Quantity</td><td>Description</td><td>Job No.</td><td>Cust.\nOrder\nNo.</td><td>Unit of\nMeasure</td><td>Unit\nPrice</td><td>Amount</td></tr><tr><td></td><td></td><td>CTS765766\n76 Deer Lane\n76 Deer Lane\nYork, YS1 5DJ</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>05/08/2021</td><td>1</td><td>Waste Collection\nGeneral Waste\n1100 litre wheelie bin</td><td>JN76665</td><td>C865454</td><td>Each</td><td>13.45</td><td>13.45</td></tr><tr><td>04/08/2021</td><td>1</td><td>Waste Collection\nFood Waste\n240 litre wheelie bin</td><td>JN76665</td><td>C865454</td><td>Each</td><td>8.54</td><td>8.54</td></tr><tr><td>02/08/2021</td><td>1</td><td>Waste Collection\nGlass\n240 litre wheelie bin</td><td>JN76665</td><td>C865454</td><td>Each</td><td>4.13</td><td>4.13</td></tr><tr><td>06/08/2021</td><td>1</td><td>Waste Collection\nMixed Recycling\n1100 litre wheelie bin</td><td>JN76665</td><td>C865454</td><td>Each</td><td>8.92</td><td>8.92</td></tr><tr><td>12/08/2021</td><td>1</td><td>Waste Collection\nGeneral Waste\n1100 litre wheelie bin</td><td>JN76548</td><td>C865454</td><td>Each</td><td>13.45</td><td>13.45</td></tr><tr><td>11/08/2021</td><td>1</td><td>Waste Collection\nFood Waste\n240 litre wheelie bin</td><td>JN76548</td><td>C865454</td><td>Each</td><td>8.54</td><td>8.54</td></tr><tr><td>09/08/2021</td><td>1</td><td>Waste Collection\nGlass</td><td>JN76548</td><td>C865454</td><td>Each</td><td>4.13</td><td>4.13</td></tr></table><p>Continued</p><p>61.16</p><p>VAT Registration No: 467 8765 66, Company Registration number: SC777565</p><p>Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG</p><p>Green</p><p>Green Dispose Ltd</p><p>Royal House, 11 Main Street</p><p>Dispose</p><p>Bolton</p><p>Greater Manchester</p><p>GM1 5RT</p><p>Telephone: 01455 7769896</p><p>Fax: 01454 87753346</p><p>Email: sales@greendispose.co.uk</p><p>Knight Bank Estates Ltd</p><p>c/o Bob Mortymer</p><p>76 Alton Castle</p><p>London SE11 6TW</p><table><tr><td>Invoice No.</td><td>GD087676</td></tr><tr><td>Document Date:</td><td>28/08/2023</td></tr><tr><td>Ext Document No.</td><td>EX876754</td></tr><tr><td>Customer No.</td><td>C865454</td></tr></table><p>Sales Invoice</p><table><tr><td>Date /\nPeriod</td><td>Quantity</td><td>Description</td><td>Job No.</td><td>Cust.\nOrder No.</td><td>Unit of\nMeasure</td><td>Unit\nPrice</td><td>Amount</td></tr><tr><td></td><td></td><td>Continued</td><td>61.16</td><td></td><td></td><td></td><td></td></tr><tr><td>13/08/2021</td><td>1</td><td>240 litre wheelie bin\nWaste Collection\nMixed Recycling\n1100 litre wheelie bin</td><td>JN76548</td><td>C865454</td><td>Each</td><td>8.92</td><td>8.92</td></tr><tr><td>19/08/2021</td><td>1</td><td>Waste Collection\nGeneral Waste\n1100 litre wheelie bin</td><td>JN76545</td><td>C865454</td><td>Each</td><td>13.45</td><td>13.45</td></tr><tr><td>18/08/2021</td><td>1</td><td>Waste Collection\nFood Waste\n240 litre wheelie bin</td><td>JN76545</td><td>C865454</td><td>Each</td><td>8.54</td><td>8.54</td></tr><tr><td>16/08/2021</td><td>1</td><td>Waste Collection\nGlass\n240 litre wheelie bin</td><td>JN76545</td><td>C865454</td><td>Each</td><td>4.13</td><td>4.13</td></tr><tr><td>20/08/2021</td><td>1</td><td>Waste Collection\nMixed Recycling\n1100 litre wheelie bin</td><td>JN76545</td><td>C865454</td><td>Each</td><td>8.92</td><td>8.92</td></tr><tr><td>August 2021</td><td>1</td><td>Monthly Management Fee</td><td>JN76546</td><td>C865454</td><td>Each</td><td>164.64</td><td>164.64</td></tr><tr><td>26/08/2021</td><td>1</td><td>Waste Collection\nGeneral Waste\n1100 litre wheelie bin</td><td>JN76547</td><td>C865454</td><td>Each</td><td>13.45</td><td>13.45</td></tr><tr><td>25/08/2021</td><td>1</td><td>Waste Collection</td><td>JN76547</td><td>C865454</td><td>Each</td><td>8.54</td><td>8.54</td></tr></table><p>Continued</p><p>291.75</p><p>VAT Registration No: 467 8765 66, Company Registration number: SC777565</p><p>Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG</p><p>Green</p><p>Green Dispose Ltd</p><p>Royal House, 11 Main Street</p><p>Dispose</p><p>Bolton</p><p>Greater Manchester</p><p>GM1 5RT</p><p>Telephone: 01455 7769896</p><p>Fax: 01454 87753346</p><p>Email: sales@greendispose.co.uk</p><p>Knight Bank Estates Ltd</p><p>c/o Bob Mortymer</p><p>76 Alton Castle</p><p>London SE11 6TW</p><table><tr><td>Invoice No.</td><td>GD087676</td></tr><tr><td>Document Date:</td><td>28/08/2023</td></tr><tr><td>Ext Document No.</td><td>EX876754</td></tr><tr><td>Customer No.</td><td>C865454</td></tr></table><p>Sales Invoice</p><table><tr><td>Date /\nPeriod</td><td>Quantity</td><td>Description</td><td>Job No.</td><td>Cust. Unit\nOrder No.</td><td>of\nMeasure</td><td>Unit\nPrice</td><td>Amount</td></tr><tr><td></td><td></td><td>Continued</td><td>291.75</td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td>Food Waste\n240 litre wheelie bin</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>23/08/2021</td><td>1</td><td>Waste Collection\nGlass\n240 litre wheelie bin</td><td>JN76547</td><td>C865454</td><td>Each</td><td>4.13</td><td>4.13</td></tr><tr><td>30/08/2021</td><td>1</td><td>Waste Collection\nGlass\n240 litre wheelie bin</td><td>JN76547</td><td>C865454</td><td>Each</td><td>4.13</td><td>4.13</td></tr><tr><td>27/08/2021</td><td>1</td><td>Waste Collection\nMixed Recycling\n1100 litre wheelie bin</td><td>JN76548</td><td>C865454</td><td>Each</td><td>8.92</td><td>8.92</td></tr></table><table><tr><td>Payment terms</td><td>30 days</td></tr><tr><td>Bank Details:</td><td></td></tr><tr><td>Account name</td><td>Green Dispose Ltd</td></tr><tr><td>Bank</td><td>Natwest</td></tr><tr><td>Account No.</td><td>87676576</td></tr><tr><td>Sort Code</td><td>01-21-33</td></tr></table><table><tr><td>Total GBP</td><td>308.93</td></tr><tr><td>20% VAT</td><td>61.79</td></tr><tr><td>Total GBP Incl Vat</td><td>370.72</td></tr></table><p>VAT Registration No: 467 8765 66, Company Registration number: SC777565</p><p>Registered Address: 2nd Floor, 27 King Street, Tullamore, TL3 8TG</p>"
    // }
    // let doingOcr = true
    let awsOcrResponse: AwsOcrResponse | null = null
    let doingOcr = false
    let imageUrl: string | null = null

    function init(element: HTMLInputElement) {
        element.focus()
    }

    async function upload() {
        if (!file) {
            return;
        }
        doingOcr = true;

        const formData = new FormData();
        formData.append('image', file[0]);
        imageUrl = URL.createObjectURL(file[0]);

        const response = await fetch('/aws-ocr', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            awsOcrResponse = await response.json();
            // await figureOutDatabaseStructure()
        } else {
            errorMessage = 'Error occurred during OCR processing.';
        }
    }

    // async function figureOutDatabaseStructure() {
    //     if (!ocrResult) {
    //         return;
    //     }
    //     const response = await fetch('/fromDocument', {
    //         method: 'POST',
    //         body: JSON.stringify({html: ocrResult})
    //     });
    //
    //     if (response.ok) {
    //         const result = await response.json();
    //         onSchemaText(result.result)
    //     } else {
    //         errorMessage = 'Error occurred during database structure processing.';
    //     }
    // }

    // function onSchemaText(schemaText: string) {
    //     const schema = JSON.parse(schemaText)
    //     const converted = convertSchemaToModels(schema)
    //     reconfigureApp(converted)
    //     newGenerationSessionId()
    //     goto("/fromDocument/data")
    // }

    function cancel() {
        goto("/")
    }

    function configureJson() {
        // goto("/fromDocument/data")
    }
</script>

<div class="grid h-screen place-items-center w-5/6 mx-auto mb-8">
    <div class="flex flex-col">
        {#if doingOcr}
            {#if awsOcrResponse === null}
                <h1 class="text-center mb-4">Performing OCR</h1>
                <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
                    Cancel
                </button>
            {:else}
                <PostOcr {awsOcrResponse} on:cancel={cancel}/>
            {/if}
        {:else}
            <h1 class="text-center mb-4">Upload your document</h1>
            <p class="text-center mb-8"><em>I will figure out what data is in it, and create a database for you</em></p>

            <input type="file" class="input input-bordered input-lg pt-3" bind:files={file} use:init/>
            <button class="btn btn-primary mt-4 btn-lg" on:click={upload}>
                Upload
            </button>
            <button class="btn btn-secondary mt-4 btn-lg" on:click={cancel}>
                Cancel
            </button>
        {/if}
        {#if errorMessage}
            <p class="text-center text-red-500 mt-4">{errorMessage}</p>
        {/if}
    </div>
</div>

<style>
    img {
        max-width: 100px;
        max-height: 100px;
    }
</style>