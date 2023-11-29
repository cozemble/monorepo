<script lang="ts">
  import Table from '$lib/components/ocr/Table.svelte'

  const tableData = {
    columns: ['Name', 'Job', 'Favorite Color'],
    rows: [
      ['Cy Ganderton', 'Quality Control Specialist', 'Blue'],
      ['Hart Hagerty', 'Desktop Support Technician', 'Purple'],
      ['Brice Swyre', 'Tax Accountant', 'Red'],
      ['Dandy Chiggins', 'Judge', 'Yellow'],
      ['Tony Gunk', 'Professional G', 'Purple'],
    ],
  }

  const table2Data = {
    columns: [
      'Date / Period',
      'Quantity',
      'Description',
      'Job No.',
      'Cust. Order No.',
      'Unit of Measure',
      'Unit Price',
      'Amount',
    ],
    rows: [
      ['', '', 'Continued', '61.16', '', '', '', ''],
      [
        '13/08/2021',
        '1',
        '240 litre wheelie bin Waste Collection Mixed Recycling 1100 litre wheelie bin',
        'JN76548',
        'C865454',
        'Each',
        '8.92',
        '8.92',
      ],
      [
        '19/08/2021',
        '1',
        'Waste Collection General Waste 1100 litre wheelie bin',
        'JN76545',
        'C865454',
        'Each',
        '13.45',
        '13.45',
      ],
      [
        '18/08/2021',
        '1',
        'Waste Collection Food Waste 240 litre wheelie bin',
        'JN76545',
        'C865454',
        'Each',
        '8.54',
        '8.54',
      ],
      [
        '16/08/2021',
        '1',
        'Waste Collection Glass 240 litre wheelie bin',
        'JN76545',
        'C865454',
        'Each',
        '4.13',
        '4.13',
      ],
      [
        '20/08/2021',
        '1',
        'Waste Collection Mixed Recycling 1100 litre wheelie bin',
        'JN76545',
        'C865454',
        'Each',
        '8.92',
        '8.92',
      ],
      [
        'August 2021',
        '1',
        'Monthly Management Fee',
        'JN76546',
        'C865454',
        'Each',
        '164.64',
        '164.64',
      ],
      [
        '26/08/2021',
        '1',
        'Waste Collection General Waste 1100 litre wheelie bin',
        'JN76547',
        'C865454',
        'Each',
        '13.45',
        '13.45',
      ],
      ['25/08/2021', '1', 'Waste Collection', 'JN76547', 'C865454', 'Each', '8.54', '8.54'],
    ],
  }

  const table3Data = {
    columns: [
      'Date / Period',
      'Quantity',
      'Description',
      'Job No.',
      'Cust. Order No.',
      'Unit of Measure',
      'Unit Price',
      'Amount',
    ],
    rows: [
      ['', '', 'CTS76576676 Deer Lane76 Deer LaneYork, YS1 5DJ', '', '', '', '', ''],
      [
        '05/08/2021',
        '1',
        'Waste Collection General Waste 1100 litre wheelie bin',
        'JN76665',
        'C865454',
        'Each',
        '13.45',
        '13.45',
      ],
      [
        '04/08/2021',
        '1',
        'Waste Collection Food Waste 240 litre wheelie bin',
        'JN76665',
        'C865454',
        'Each',
        '8.54',
        '8.54',
      ],
      [
        '02/08/2021',
        '1',
        'Waste Collection Glass 240 litre wheelie bin',
        'JN76665',
        'C865454',
        'Each',
        '4.13',
        '4.13',
      ],
      [
        '06/08/2021',
        '1',
        'Waste Collection Mixed Recycling 1100 litre wheelie bin',
        'JN76665',
        'C865454',
        'Each',
        '8.92',
        '8.92',
      ],
      [
        '12/08/2021',
        '1',
        'Waste Collection General Waste 1100 litre wheelie bin',
        'JN76548',
        'C865454',
        'Each',
        '13.45',
        '13.45',
      ],
      [
        '11/08/2021',
        '1',
        'Waste Collection Food Waste 240 litre wheelie bin',
        'JN76548',
        'C865454',
        'Each',
        '8.54',
        '8.54',
      ],
      ['09/08/2021', '1', 'Waste Collection Glass', 'JN76548', 'C865454', 'Each', '4.13', '4.13'],
    ],
  }

  const table4Data = {
    columns: [
      'Date / Period',
      'Quantity',
      'Description',
      'Job No.',
      'Cust. Order No.',
      'Unit of Measure',
      'Unit Price',
      'Amount',
    ],
    rows: [
      ['', '', 'Continued', '291.75', '', '', '', ''],
      [
        '23/08/2021',
        '1',
        'Waste Collection Glass 240 litre wheelie bin',
        'JN76547',
        'C865454',
        'Each',
        '4.13',
        '4.13',
      ],
      [
        '30/08/2021',
        '1',
        'Waste Collection Glass 240 litre wheelie bin',
        'JN76547',
        'C865454',
        'Each',
        '4.13',
        '4.13',
      ],
      [
        '27/08/2021',
        '1',
        'Waste Collection Mixed Recycling 1100 litre wheelie bin',
        'JN76548',
        'C865454',
        'Each',
        '8.92',
        '8.92',
      ],
      [
        'August 2021',
        '1',
        'Monthly Management Fee',
        'JN76546',
        'C865454',
        'Each',
        '164.64',
        '164.64',
      ],
      [
        '26/08/2021',
        '1',
        'Waste Collection General Waste 1100 litre wheelie bin',
        'JN76547',
        'C865454',
        'Each',
        '13.45',
        '13.45',
      ],
      ['25/08/2021', '1', 'Waste Collection', 'JN76547', 'C865454', 'Each', '8.54', '8.54'],
    ],
  }
</script>

<div class="p-6 w-full bg-base-200 rounded-box flex flex-col items-center flex-grow h-[200vh]">
  <span class="font-semibold text-center p-10">Here you will see your document scan results.</span>

  <div class="overflow-x-auto flex flex-col gap-5">
    <Table {tableData} ordered />
    <Table tableData={table2Data} ordered />
    <Table tableData={table3Data} ordered />
    <Table tableData={table4Data} ordered />
  </div>
</div>

<button class="btn btn-success self-end justify-self-end btn-disabled" disabled>Next</button>
