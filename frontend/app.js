const apiBase = 'http://localhost:3000/api/employees';
const modal = new bootstrap.Modal(document.getElementById('employeeModal'));


async function loadEmployees() {
        try {
          const response = await fetch(apiBase);
          const employees = await response.json();

          const tbody = document.getElementById('employeeTableBody');
          const totalCount = document.getElementById('totalCount');
          const roleCount = document.getElementById('roleCount');

          totalCount.textContent = employees.length;
          roleCount.textContent = new Set(employees.map(e => e.position)).size;

          if (!employees.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No employees found.</td></tr>';
            return;
          }

          tbody.innerHTML = employees.map(employee => {
            const rawId = employee._id && typeof employee._id === 'object' && employee._id.$oid ? employee._id.$oid : employee._id;
            const shortId = rawId ? String(rawId).slice(-6) : '';
            return `
              <tr>
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar" style="width:40px;height:40px;">${(employee.name || 'E').charAt(0).toUpperCase()}</div>
                    <div>
                      <div class="fw-semibold">${employee.name || 'Unnamed'}</div>
                      <div class="text-muted small">ID: ${shortId}</div>
                    </div>
                  </div>
                </td>
                <td>${employee.salary || '-'}</td>
                <td>${employee.position || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" onclick="editEmployee('${rawId || ''}')"><i class="fa-solid fa-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${rawId || ''}')"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            `;
          }).join('');
        } catch (error) {
          document.getElementById('employeeTableBody').innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Failed to load data.</td></tr>';
          console.error(error);
        }
      }

function resetForm() {
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').value = '';
      }

      
async function saveEmployee() {
        const id = document.getElementById('employeeId').value;
        const payload = {
          name: document.getElementById('name').value,
          salary: Number(document.getElementById('salary').value || 0),
          position: document.getElementById('position').value,
          address: {
            street: '',
            city: '',
            state: '',
            zip_code: ''
          },
          age: 0,
          certifications: [],
          contact_numbers: [],
          emergency_contact: {
            name: '',
            relation: '',
            contact_number: ''
          },
          employee_id: Math.floor(Date.now() / 1000),
          is_active: true,
          join_date: new Date().toISOString(),
          metadata: {
            department: 'General'
          },
          previous_companies: [],
          skills: []
        };

        try {
          const options = {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          };

          const url = id ? `${apiBase}/${id}` : apiBase;
          const response = await fetch(url, options);
          const data = await response.json();

          if (!response.ok) throw new Error(data.message || 'Request failed');

          modal.hide();
          resetForm();
          loadEmployees();
          alert(data.message || 'Saved successfully');
        } catch (error) {
          alert(error.message);
        }
      }

async function editEmployee(id) {
        try {
          const response = await fetch(`${apiBase}/${id}`);
          const employee = await response.json();
          const employeeId = employee._id && typeof employee._id === 'object' && employee._id.$oid ? employee._id.$oid : employee._id;

          document.getElementById('employeeId').value = employeeId || '';
          document.getElementById('name').value = employee.name || '';
          document.getElementById('salary').value = employee.salary || '';
          document.getElementById('position').value = employee.position || '';
          modal.show();
        } catch (error) {
          alert('Failed to load employee');
        }
      }

async function deleteEmployee(id) {
        if (!confirm('Delete this employee?')) return;

        try {
          const response = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Delete failed');
          loadEmployees();
          alert(data.message || 'Deleted');
        } catch (error) {
          alert(error.message);
        }
      }

window.onload = loadEmployees;
