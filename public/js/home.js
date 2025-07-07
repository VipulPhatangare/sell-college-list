const central_object = {
    mainCaste: '',
    casteColumn: '',
    specialReservation: '',
    branchCategories: [],
    final_college_list : [],
    formData : {}
};

let selectedBranches = [];

// DOM elements
const casteSelect = document.getElementById('caste');
const tfwsContainer = document.getElementById('tfwsContainer');
const tfwsCheckbox = document.getElementById('tfws');
const collegeForm = document.getElementById('collegeForm');
const resultsContainer = document.getElementById('resultsContainer');
const collegeCardsContainer = document.getElementById('collegeCards');
const selectedCountElement = document.getElementById('selectedCount');
const regionCheckboxGroup = document.getElementById('regionCheckboxGroup');
const roundSelect = document.getElementById('round');
const homeuniversitySelect = document.getElementById('homeUniversity');
const customBranchBtn = document.getElementById('customBranchBtn');
const branchSelect = document.getElementById('branch');
const selectedBranchesContainer = document.getElementById('selectedBranchesContainer');
const branchSelectionGroup = document.getElementById('branchSelectionGroup');
const otherBranchCheckbox = document.getElementById('otherBranchCheckbox');

// Initialize
updateSelectedCount(0);

// Event Listeners
casteSelect.addEventListener('change', handleCasteChange);
collegeForm.addEventListener('submit', handleFormSubmit);
regionCheckboxGroup.addEventListener('change', handleRegionCheckboxChange);
customBranchBtn.addEventListener('click', toggleBranchSelection);
branchSelect.addEventListener('change', handleBranchSelection);

// Initialize the application
document.addEventListener("DOMContentLoaded", initilise);

async function initilise() {
    await fetchBranches();
    await fetchCity();
    await fetchUniversity();
    initBranchSelection();
}

// Branch Category Checkbox Functions
function initBranchSelection() {
    const checkboxes = document.querySelectorAll('.branch-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleBranchCategoryChange(this);
        });
    });
    
    // Initialize with "All" selected
    const allCheckbox = document.querySelector('.branch-checkbox[data-all="true"]');
    allCheckbox.checked = true;
    central_object.branchCategories = ['All'];
}

function handleBranchCategoryChange(checkbox) {
    if (checkbox.dataset.all === 'true') {
        // "All" was checked
        if (checkbox.checked) {
            // Uncheck all other checkboxes
            document.querySelectorAll('.branch-checkbox:not([data-all="true"])').forEach(cb => {
                cb.checked = false;
            });
            branchSelectionGroup.classList.add('hidden');
            central_object.branchCategories = ['All'];
        }
    } else {
        // Other checkbox was changed
        if (checkbox.checked) {
            // Uncheck "All" if it was checked
            const allCheckbox = document.querySelector('.branch-checkbox[data-all="true"]');
            allCheckbox.checked = false;
            central_object.branchCategories = central_object.branchCategories.filter(cat => cat !== 'All');
            
            // Show branch selection if "Other" was checked
            if (checkbox === otherBranchCheckbox) {
                branchSelectionGroup.classList.remove('hidden');
            }
        } else {
            // If "Other" was unchecked, hide the branch selection
            if (checkbox === otherBranchCheckbox) {
                branchSelectionGroup.classList.add('hidden');
            }
        }
        
        // Update the central_object.branchCategories
        updateSelectedBranchCategories();
        
        // If no checkboxes are selected, check "All"
        if (central_object.branchCategories.length === 0) {
            const allCheckbox = document.querySelector('.branch-checkbox[data-all="true"]');
            allCheckbox.checked = true;
            central_object.branchCategories = ['All'];
            branchSelectionGroup.classList.add('hidden');
        }
    }
}

function updateSelectedBranchCategories() {
    central_object.branchCategories = [];
    document.querySelectorAll('.branch-checkbox:checked').forEach(checkbox => {
        central_object.branchCategories.push(checkbox.value);
    });
}

// Branch Selection Functions - MODIFIED PERMANENT DROPDOWN BEHAVIOR
function toggleBranchSelection() {
    customBranchBtn.style.display = 'none'; // Hide button permanently
    branchSelect.classList.remove('hidden');
    branchSelect.focus();
}

function handleBranchSelection() {
    if (this.value && !selectedBranches.includes(this.value)) {
        selectedBranches.push(this.value);
        updateSelectedBranchesDisplay();
        
        // Remove selected option from dropdown
        this.querySelector(`option[value="${this.value}"]`).remove();
        
        // Reset dropdown but keep it visible
        this.value = '';
    }
}

function updateSelectedBranchesDisplay() {
    selectedBranchesContainer.innerHTML = '';
    
    selectedBranches.forEach(branchValue => {
        const branchText = branchSelect.querySelector(`option[value="${branchValue}"]`)?.text || branchValue;
        
        const tag = document.createElement('div');
        tag.className = 'branch-tag';
        tag.innerHTML = `
            ${branchText}
            <button type="button" data-value="${branchValue}">&times;</button>
        `;
        
        tag.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            removeBranch(branchValue);
        });
        
        selectedBranchesContainer.appendChild(tag);
    });
}

function removeBranch(branchValue) {
    selectedBranches = selectedBranches.filter(b => b !== branchValue);
    
    // Add the option back to the dropdown
    const optionText = [...branchSelect.options].find(opt => opt.value === branchValue)?.text || branchValue;
    if (optionText) {
        const option = new Option(optionText, branchValue);
        branchSelect.appendChild(option);
    }
    
    updateSelectedBranchesDisplay();
}

// [Rest of your existing functions remain exactly the same...]
// Form Handling Functions
function handleCasteChange() {
    if (this.value === 'OPEN' || this.value === 'OBC' || this.value === 'SEBC') {
        tfwsContainer.style.display = 'block';
    } else {
        tfwsContainer.style.display = 'none';
        tfwsCheckbox.checked = false;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get all checked region checkboxes
    const regionCheckboxes = document.querySelectorAll('input[name="region"]:checked');
    const regions = Array.from(regionCheckboxes).map(cb => cb.value);
    

    // central_object.specialReservation = document.getElementById('specialReservation').value;
    
    // If "All Regions" is selected, ignore other selections
    const finalRegions = regions.includes("All") ? ["All"] : regions;
    
    const formData = {
        generalRank: parseInt(document.getElementById('generalRank').value),
        caste: casteSelect.value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        tfws: tfwsCheckbox.checked,
        branchCategories: central_object.branchCategories,
        city: finalRegions,
        selected_branches: selectedBranches,
        homeuniversity: homeuniversitySelect.value
    };

    central_object.formData = formData;

    // Validate rank is positive integer
    if (isNaN(formData.generalRank)) {
        alert('Please enter a valid percentile');
        return;
    }


    generateCollegeList(formData);
}

function handleFinalizeClick() {
    
}

function handleRegionCheckboxChange(e) {
    if (e.target.value === "All" && e.target.checked) {
        const otherCheckboxes = document.querySelectorAll('input[name="region"]:not([value="All"])');
        otherCheckboxes.forEach(cb => cb.checked = false);
    } else if (e.target.value !== "All" && e.target.checked) {
        const allCheckbox = document.querySelector('input[name="region"][value="All"]');
        allCheckbox.checked = false;
    }
}

// Data Fetching Functions
async function fetchBranches() {
    try {
        const response = await fetch('/api/fetchBranches');
        let data = await response.json();

        branchSelect.innerHTML = '<option value="" disabled selected>Select branches</option>';

        data = data.reduce((acc, curr) => {
            if (!acc.some(item => item.branch_name === curr.branch_name)) {
                acc.push(curr);
            }
            return acc;
        }, []);

        data.forEach(element => {
            if(element.Branch_category == 'OTHER'){
                const option = document.createElement('option');
                option.value = `${element.branch_name}`;
                option.innerHTML = `${element.branch_name}`;
                branchSelect.appendChild(option);
            }
            
        });
    } catch (error) {
        console.log(error);
    }
}

async function fetchCity() {
    try {
        const response = await fetch('/api/fetchcity');
        const data = await response.json();

        regionCheckboxGroup.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" name="region" value="All" checked>
                <span>All Regions</span>
            </label>
        `;

        data.forEach(element => {
            const child = document.createElement('label');
            child.classList.add('checkbox-label');

            child.innerHTML = `
                <input type="checkbox" name="region" value="${element.city}">
                <span>${element.city}</span>
            `;

            regionCheckboxGroup.appendChild(child);
        });
    } catch (error) {
        console.log(error);
    }
}

async function fetchUniversity() {
    try {
        const response = await fetch('/api/fetchUniversity');
        const data = await response.json();

        homeuniversitySelect.innerHTML = `<option value="" disabled selected>Select your home university</option>`;

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element.university}`;
            option.innerHTML = `${element.university}`;
            homeuniversitySelect.appendChild(option);
        });
    } catch (error) {
        console.log(error);
    }
}

// College List Functions
async function generateCollegeList(formData) {
    try {
        const response = await fetch('/api/College_list', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        // console.log(data);
        displayColleges(data, formData);
    } catch (error) {
        console.log('Error:', error);
        alert('An error occurred while fetching college data');
    }
}

function displayColleges(colleges, formData) {
    collegeCardsContainer.innerHTML = '';

    // console.log(central_object.specialReservation);
    // if (central_object.specialReservation != 'No') {
    //     collegeCardsContainer.innerHTML = `
    //         <div class="contact-message">
    //             <h3>Thank you for your application!</h3>
    //             <p>Our team will contact you within 24 hours regarding your ${formData.specialReservation} reservation.</p>
    //         </div>
    //     `;
    //     resultsContainer.style.display = 'block';
    //     return;
    // }
    
    // Original college list display logic
    if (!colleges || colleges.length === 0) {
        collegeCardsContainer.innerHTML = '<p>No colleges found matching your criteria.</p>';
        resultsContainer.style.display = 'block';
        return;
    }

    const collegeCount = 100;
    let count = 1;
    colleges = colleges.slice(0, collegeCount);
    central_object.final_college_list = colleges;
    colleges.forEach(college => {
        if(formData.tfws){
            const card_tfws = createCollegeCard(college, formData, count,true);
            count++;
            collegeCardsContainer.appendChild(card_tfws);
        }
        const card = createCollegeCard(college, formData, count,false);
        count++;
        collegeCardsContainer.appendChild(card);
    });
    
    resultsContainer.style.display = 'block';
    updateSelectedCount(colleges.length);
}

function createCollegeCard(college, formData, count, tfws) {
    
    const card = document.createElement('div');
    card.className = 'college-card selected';
    card.dataset.code = college.choice_code;
    let college_code = college.choice_code;
    if(tfws){
        college_code = `${college_code}T`;
    }

    let card_content = `
        <div class="college-card-header">
            <div class="college-code">${count}</div>
            <div class="college-code">${college_code}</div>
            <div class="college-code">Seat type: ${college.seat_type}</div>
            
        </div>
        <div class="college-name">${college.college_name}</div>
        <div>University: ${college.university}</div>
        <div>${college.branch_name}</div>
        <div class="college-details">
            <div class="college-detail">
                <div class="college-detail-label">GOPEN</div>
                <div>${college.gopen}</div>
            </div>
    `;
    
    
    if (formData.gender == 'Female') {
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">LOPEN</div>
                <div>${college.lopen}</div>
            </div>
        `;
        
        if (formData.caste != 'OPEN' && formData.caste != 'EWS') {
            let caste_column = `L${formData.caste}`;
            card_content += `
            <div class="college-detail">
                <div class="college-detail-label">${caste_column}</div>
                <div>${college[caste_column.toLowerCase()]}</div>
            </div>
            `;
        }
    } else {
        if (formData.caste != 'OPEN' && formData.caste != 'EWS') {
            let caste_column = `G${formData.caste}`;
            card_content += `
            <div class="college-detail">
                <div class="college-detail-label">${caste_column}</div>
                <div>${college[caste_column.toLowerCase()]}</div>
            </div>
            `;
        }
    }

    if(formData.caste == 'EWS'){
        card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">EWS</div>
                <div>${college.ews}</div>
            </div>
        `;
    }

    if (formData.tfws) {
        card_content += `
            <div class="college-detail">
                <div class="college-detail-label">TFWS</div>
                <div>${college.tfws}</div>
            </div>
        `;
    }



    card.innerHTML = card_content + `</div>`;

    return card;
}

function updateSelectedCount(count) {
    if (typeof count === 'number') {
        selectedCountElement.textContent = `${count} selected`;
    } else {
        const selectedCount = document.querySelectorAll('.college-card.selected').length;
        selectedCountElement.textContent = `${selectedCount} selected`;
    }
}


document.getElementById('downloadPdfBtn').addEventListener('click', generatePdfList);

function generatePdfList() {
    const selectedColleges = document.querySelectorAll('.college-card.selected');
    if (selectedColleges.length === 0) {
        alert('Please select at least one college');
        return;
    }

    const pdfTableBody = document.getElementById('pdfTableBody');
    pdfTableBody.innerHTML = '';
    let index = 1;
    central_object.final_college_list.forEach((college) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index}</td>
            <td>${college.choice_code}</td>
            <td>${college.college_name}</td>
            <td>${college.branch_name}</td>
            <td>${college.university}</td>
            <td>${college.seat_type}</td>
        `;
        index++;
        pdfTableBody.appendChild(row);
        
        if(central_object.formData.tfws){
            const row_1 = document.createElement('tr');
            row_1.innerHTML = `
                <td>${index}</td>
                <td>${college.choice_code}T</td>
                <td>${college.college_name}</td>
                <td>${college.branch_name}</td>
                <td>${college.university}</td>
                <td>${college.seat_type}</td>
            `;
            index++;
            pdfTableBody.appendChild(row_1);
        }
    });

    // document.getElementById('pdfContainer').classList.remove('hidden');
    // document.getElementById('pdfContainer').scrollIntoView({ behavior: 'smooth' });
    printPdf();
}

function printPdf() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>CampusDekho.ai</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 6px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .pdf-student{
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        margin: 50px;
                    }
                    .pdf-student-info{
                        width: 100%;
                        height: 15px;
                        font-size: 20px;
                        color: black;
                        margin: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="pdf-student">
                    <div class="pdf-student-info">Name : Campus Dekho</div>
                    <div class="pdf-student-info">General Rank : ${central_object.formData.generalRank}</div>
                    <div class="pdf-student-info">Gender : ${central_object.formData.gender}</div>
                    <div class="pdf-student-info">Home University :  ${central_object.formData.homeuniversity}</div>
                    <div class="pdf-student-info">Caste :  ${central_object.formData.caste}</div>
                </div>

                <h1>MHT CET Preference list</h1>
                
                ${document.getElementById('pdfTable').outerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}


