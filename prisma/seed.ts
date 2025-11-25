import { prisma } from '../src/lib/prisma'

async function main() {
  // Seed company settings
  const companySettings = await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'SRI LAXMI NARASIMHA SWAMY WELDING WORKS',
      tradeLine: 'Trader: Column Boxes, Centring Boxes',
      address: 'Sy No:45, H.No:1-35-462/4, BHEL Colony, Rasoolpura, Secunderabad, Telangana',
      email: 'srikanthkittu6@gmail.com',
      mobile: '9394749715, 9989989638',
      gstin: '36ADSFS2351R1Z6',
      bankName: 'UNION BANK OF INDIA',
      accountNo: '050511100004632',
      branch: 'R.P ROAD, SECUNDERABAD',
      ifscCode: 'UBIN0805050',
      stateCode: '36',
    },
  })

  console.log('✅ Company settings seeded:', companySettings.name)

  // Seed some sample products
  const products = [
    {
      name: 'MS CENTRING SHEETS',
      description: 'Mild Steel Centring Sheets',
      hsnCode: '7308',
      rate: 73.00,
      uom: 'Kgs',
    },
    {
      name: 'VERTICAL PIPES',
      description: 'Scaffolding Vertical Pipes',
      hsnCode: '7308',
      rate: 75.00,
      uom: 'Kgs',
    },
    {
      name: 'LEDGER PIPES',
      description: 'Scaffolding Ledger Pipes',
      hsnCode: '7308',
      rate: 75.00,
      uom: 'Kgs',
    },
    {
      name: 'U JACK',
      description: 'U Jack for Scaffolding',
      hsnCode: '7308',
      rate: 150.00,
      uom: 'Pcs',
    },
    {
      name: 'BASE JACK',
      description: 'Base Jack for Scaffolding',
      hsnCode: '7308',
      rate: 150.00,
      uom: 'Pcs',
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('✅ Sample products seeded')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
