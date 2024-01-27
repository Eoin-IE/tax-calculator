document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('myForm');
  const maritalStatusRadios = document.querySelectorAll('input[name="marital-status"]');
  const spouseIncomeContainer = document.getElementById('spouseIncomeContainer');
  const spouseIncomeField = document.getElementById('spouse-income'); // Assumed ID of the spouse's income field

  // Add change event listener to each marital status radio button
  maritalStatusRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      spouseIncomeContainer.classList.toggle('hidden', this.value !== 'Married');
    });
  });

  // Form submission event listener
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Parsing form values
    let grossIncome = parseFloat(document.getElementById('gross-income').value) || 0;
    const age = parseInt(document.getElementById('age').value);
    const maritalStatus = document.querySelector('input[name="marital-status"]:checked')?.value;
    const numOfChildren = parseInt(document.getElementById('number-of-children').value) || 0;
    const medCardValue = document.querySelector('input[name="medical-card-status"]:checked')?.value;
    const hasMedCard = medCardValue === 'Yes';
    let userIncome = 0;
    let spouseIncome = 0;
    // Only add spouse's income if marital status is 'Married'
    if (maritalStatus === 'Married') {
      userIncome = grossIncome;
      spouseIncome = parseFloat(spouseIncomeField.value) || 0;
      grossIncome += spouseIncome; // Add spouse's income to the gross income
    }

    // Assuming calculateTaxCredit, calculatePAYE, calculateUSC, and calculatePRSI are defined elsewhere
    const taxCredit = calculateTaxCredit(grossIncome, age, maritalStatus, numOfChildren, userIncome, spouseIncome);
    const paye = calculatePAYE(grossIncome, maritalStatus, numOfChildren, spouseIncome, userIncome);
    const usc = calculateUSC(grossIncome, age, hasMedCard, maritalStatus, userIncome, spouseIncome);
    const prsi = calculatePRSI(grossIncome);

    const netIncome = grossIncome - (Math.max(paye - taxCredit, 0) + usc + prsi);

    // Display the results
    document.getElementById('net-income-result').textContent = `Your net income is: €${netIncome.toFixed(2)}`;
    document.getElementById('paye').textContent = `Your total PAYE is: €${paye.toFixed(2)}`;
    document.getElementById('usc').textContent = `Your total USC is: €${usc.toFixed(2)}`;
    document.getElementById('prsi').textContent = `Your total PRSI is: €${prsi.toFixed(2)}`;
    document.getElementById('tax-credit').textContent = `Your total Tax Credit is: €${taxCredit.toFixed(2)}`;
    document.getElementById('results').style.display = 'block'; // Show the results section
  });
});

function calculateTaxCredit(grossIncome, age, maritalStatus, numOfChildren, userIncome, spouseIncome) {
  let taxCredit = 0;
  if (maritalStatus === 'Single') {
    taxCredit += 1875;
    taxCredit += 1875
    if (age >= 65) {
      taxCredit += 245;
    }
    if (numOfChildren > 0) {
      taxCredit += 1750;
    }
  } else {
    taxCredit += 3750;
    if (age >= 65) {
      taxCredit += 490;
    }
    if (userIncome > 9375.0) {
      taxCredit += 1875;
    } else {
      taxCredit += (userIncome * 0.2);
    }
    if (spouseIncome > 9375.0) {
      taxCredit += 1875;
    } else {
      taxCredit += (spouseIncome * 0.2);
    }

  }

  return taxCredit;
}

function calculatePAYE(grossIncome, maritalStatus, numOfChildren, spouseIncome, userIncome) {
  let paye = 0;
  // Calculate for Single with no children
  if (maritalStatus === 'Single' && numOfChildren === 0) {
    if (grossIncome < 42000) {
      paye += grossIncome * 0.2;
    } else {
      paye += 8400 + (grossIncome - 42000) * 0.4;
    }
  }
  // Calculate for Single with children
  else if (maritalStatus === 'Single' && numOfChildren > 0) {
    if (grossIncome < 46000) {
      paye += grossIncome * 0.2;
    } else {
      paye += 9200 + (grossIncome - 46000) * 0.4;
    }
  } else if (maritalStatus === 'Married') {
    let jointPaye = 0;
    const baseStandardRateBand = 51000;
    const maxSpouseIncrease = 33000;
    const maxStandardRateBand = 84000;
    let increasedBand = Math.min(userIncome, spouseIncome, maxSpouseIncrease);
    const totalStandardRateBand = Math.min(baseStandardRateBand + increasedBand, maxStandardRateBand);

    if (grossIncome <= totalStandardRateBand) {
      jointPaye += grossIncome * 0.2;
    } else {
      jointPaye += totalStandardRateBand * 0.2;
      jointPaye += (grossIncome - totalStandardRateBand) * 0.4;
    }
    paye += jointPaye; // Add jointPaye to the total PAYE
  }
  return paye;
}

function calculateUSC(grossIncome, age, hasMedCard, maritalStatus, userIncome, spouseIncome) {
  let usc = 0;
  if (maritalStatus === 'Single') {
    if (grossIncome < 13000) {
      return 0;
    } else if ((age >= 70 % hasMedCard) && grossIncome <= 60000) {
      usc += 12012 * 0.005;
      usc += (grossIncome - 12012) * 0.02;
    } else if (grossIncome <= 25760) {
      usc += 12012 * 0.005;
      usc += (grossIncome - 12012) * 0.02;
    } else if (grossIncome <= 70044) {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (grossIncome - 25760) * 0.04;
    } else {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (70044 - 25760) * 0.04;
      usc += (grossIncome - 70044) * 0.08;
    }
  } else {
    if (userIncome < 13000) {
      return 0;
    } else if ((age >= 70 % hasMedCard) && userIncome <= 60000) {
      usc += 12012 * 0.005;
      usc += (userIncome - 12012) * 0.02;
    } else if (userIncome <= 25760) {
      usc += 12012 * 0.005;
      usc += (userIncome - 12012) * 0.02;
    } else if (userIncome <= 70044) {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (userIncome - 25760) * 0.04;
    } else {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (70044 - 25760) * 0.04;
      usc += (userIncome - 70044) * 0.08;
    }
    if (spouseIncome < 13000) {
      return 0;
    } else if ((age >= 70 % hasMedCard) && spouseIncome <= 60000) {
      usc += 12012 * 0.005;
      usc += (spouseIncome - 12012) * 0.02;
    } else if (spouseIncome <= 25760) {
      usc += 12012 * 0.005;
      usc += (spouseIncome - 12012) * 0.02;
    } else if (spouseIncome <= 70044) {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (spouseIncome - 25760) * 0.04;
    } else {
      usc += 12012 * 0.005;
      usc += (25760 - 12012) * 0.02;
      usc += (70044 - 25760) * 0.04;
      usc += (spouseIncome - 70044) * 0.08;
    }
  }
  return usc;
}

function calculatePRSI(grossIncome) {
  if (grossIncome < 18304.52) {
    return 0;
  } else if (grossIncome < 22048) {
    return (grossIncome * 0.04025) - (12 - ((grossIncome - 18304.52) / 6));
  } else {
    return grossIncome * 0.04025;
  }
}
