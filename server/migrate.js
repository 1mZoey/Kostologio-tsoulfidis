import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const all = await db.collection('Kostologio').find({}).toArray();

const products = all.filter(d => 
  ['floor', 'cladding', 'cobble', 'aggregate', 'texture'].includes(d.category)
);

const costItems = all.filter(d => 
  ['raw_load', 'hammer_load'].includes(d.category)
);

if (products.length > 0) {
  await db.collection('products').insertMany(products);
  console.log(`✅ ${products.length} products inserted`);
}

if (costItems.length > 0) {
  await db.collection('costitems').insertMany(costItems);
  console.log(`✅ ${costItems.length} cost items inserted`);
}

await mongoose.disconnect();
console.log('✅ Migration done!');
