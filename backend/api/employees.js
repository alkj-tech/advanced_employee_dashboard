const express = require('express');
const { getEmployeesCollection, ObjectId } = require('../db');

const router = express.Router();

function buildEmployeeDocument(input = {}) {
  const address = input.address && typeof input.address === 'object'
    ? {
        street: input.address.street || '',
        city: input.address.city || '',
        state: input.address.state || '',
        zip_code: input.address.zip_code || '',
      }
    : {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      };

  const emergencyContact = input.emergency_contact && typeof input.emergency_contact === 'object'
    ? {
        name: input.emergency_contact.name || '',
        relation: input.emergency_contact.relation || '',
        contact_number: input.emergency_contact.contact_number || '',
      }
    : {
        name: '',
        relation: '',
        contact_number: '',
      };

  const salaryValue = input.salary === undefined || input.salary === '' ? 0 : Number(input.salary);

  return {
    ...input,
    _id: input._id ? new ObjectId(input._id) : new ObjectId(),
    name: String(input.name || ''),
    position: String(input.position || ''),
    salary: Number.isFinite(salaryValue) ? salaryValue : 0,
    address,
    age: Number.isInteger(input.age) ? input.age : 0,
    certifications: Array.isArray(input.certifications) ? input.certifications : [],
    contact_numbers: Array.isArray(input.contact_numbers) ? input.contact_numbers : [],
    emergency_contact: emergencyContact,
    employee_id: Number.isInteger(input.employee_id) ? input.employee_id : Math.floor(Date.now() / 1000),
    is_active: typeof input.is_active === 'boolean' ? input.is_active : true,
    join_date: input.join_date ? new Date(input.join_date) : new Date(),
    metadata: input.metadata === undefined || input.metadata === null ? { department: 'General' } : input.metadata,
    previous_companies: Array.isArray(input.previous_companies) ? input.previous_companies : [],
    skills: Array.isArray(input.skills) ? input.skills : [],
  };
}

router.get('/', async (req, res) => {
  try {
    const collection = await getEmployeesCollection();
    const employees = await collection.find({}).toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const collection = await getEmployeesCollection();
    const employee = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const collection = await getEmployeesCollection();
    const employeeDocument = buildEmployeeDocument(req.body);
    const result = await collection.insertOne(employeeDocument);
    res.status(201).json({ message: 'Employee created', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const collection = await getEmployeesCollection();
    const existingEmployee = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updatedDocument = buildEmployeeDocument({
      ...existingEmployee,
      ...req.body,
      _id: existingEmployee._id,
    });

    const result = await collection.updateOne(
      { _id: existingEmployee._id },
      { $set: updatedDocument }
    );

    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const collection = await getEmployeesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
});

module.exports = router;
