//ЛР 2. Вариант 8. Построить СКНФ для заданной формулы.
//Автор: Смоленский П.М., гр. 721702
	var answerFirstTask = 0;


    function main(){
    var formula = document.getElementById('userFormula').value;
    answerFirstTask = checkValidation(formula);
    if (formula == ""){
        alert("Пустая строка!");
    }

    if (answerFirstTask == 1) {
		document.getElementById("result").innerHTML = "";
		document.getElementById("answer").innerHTML = "";
		var resultSKNF = buildFormula(formula);
		document.getElementById("answer").innerHTML = resultSKNF;
		var userSKNF = document.getElementById('userSKNF').value;
		if (userSKNF == resultSKNF){
			document.getElementById("result").innerHTML = "Верно!";
		}
		else {
			document.getElementById("result").innerHTML = "Неверно!"

		}
	}
        else {
		alert("Строка не является формулой логики высказываний!");
	}
        

    }

	function checkValidation(formula) 
	{
		var constOrAtom = formula.match(/^[A-Z0-1]{1}$/);
		if(constOrAtom != null) answerFirstTask = 1;			
		else 
		{	
			var oldFormula = formula;
			formula = formula.replace(/(\([A-Z0-1]{1}([&\|~]|(->))[A-Z0-1]{1}\))|(\(![A-Z0-1]\))/g, "1");
		
			if(oldFormula != formula)
				checkValidation(formula);
			else answerFirstTask = 0;
		}
		return answerFirstTask;
	}


	function buildFormula(formula) {
		{
			let sknfFormula = "";
			let interpretation = buildInterpretation(formula);
			let truthTable = buildTruthTable(formula, interpretation);
			sknfFormula = buildConjunctionOfDisjuncts(interpretation, truthTable);

			return sknfFormula;
		}

		function buildInterpretation(formula) {
			let atoms = findAllUniqueAtoms(formula);

			let columnsNumber = atoms.length;
			let linesNumber = Math.pow(2, columnsNumber);
			let interpretation = [];

			for (let i = 0; i < linesNumber; i++) {
				let binary = convertToBinaryWithLength(i, columnsNumber);
				let atomsValue = {};

				for (let j = 0; j < columnsNumber; j++) {
					atomsValue[atoms[j]] = Number(binary[j]);
				}

				interpretation.push(atomsValue);
			}

			return interpretation;
		}

		function findAllUniqueAtoms(formula) {
			let atoms = formula.match(/[A-Z]+\d*/g);

			let object = {};
			for (let i = 0; i < atoms.length; i++) {
				let element = atoms[i];
				object[element] = true;
			}

			return Object.keys(object);
		}

		function convertToBinaryWithLength(number, length) {
			const binRadix = 2;

			let binary = number.toString(binRadix);

			let binaryLength = binary.length;

			if (binaryLength < length) {
				let addingNumber = length - binaryLength;

				for (let i = 0; i < addingNumber; i++) {
					binary = '0' + binary;
				}
			}

			return binary;
		}

		function buildTruthTable(formula, interpretation) {
			let truthTable = [];

			let subforms = findAllSubforms(formula);
			let linesNumber = interpretation.length;
			for (let i = 0; i < linesNumber; i++) {
				truthTable.push(calculateFormula(formula, subforms, interpretation[i]));
			}

			return truthTable;
		}

		function findAllSubforms(formula) {
			let subforms = {};
			let regexp = /~|->|&|\||!/g;
			let found;

			while ((found = regexp.exec(formula))) {
				let subform;
				let subformKey;
				if (found[0] === '!') {
					subform = buildUnaryFormula(found, formula);
					subformKey = '(' + subform["operator"] + subform["operand"] + ')';
				} else {
					subform = buildBinaryFormula(found, formula);
					subformKey = '(' + subform["first operand"] + subform["operator"] + subform["second operand"] + ')';
				}

				subforms[subformKey] = subform;
			}

			return subforms;
		}

		function buildUnaryFormula(found, formula) {
			let subform = {};
			subform["operator"] = found[0];
			subform["operand"] = findOperandInRightPart(formula, found.index);

			return subform;
		}

		function buildBinaryFormula(found, formula) {
			let subform = {};
			let operator = found[0];
			let operatorIndex = found.index;

			subform["operator"] = operator;
			subform["first operand"] = findOperandInLeftPart(formula, operatorIndex);

			if (operator === "->") {
				operatorIndex++;
			}

			subform["second operand"] = findOperandInRightPart(formula, operatorIndex);

			return subform;
		}

		function findOperandInLeftPart(formula, operatorIndex) {
			let i = operatorIndex - 1;
			let unclosedBrackets = 0;

			while (i > 0) {
				if (formula[i] === ')') {
					unclosedBrackets++;
				} else if (formula[i] === '(') {
					if (unclosedBrackets === 0) {
						break;
					} else {
						unclosedBrackets--;
					}
				}

				i--;
			}

			return formula.substring(i + 1, operatorIndex);
		}

		function findOperandInRightPart(formula, operatorIndex) {
			let i = operatorIndex + 1;
			let unclosedBrackets = 0;

			while (i < formula.length) {
				if (formula[i] === '(') {
					unclosedBrackets++;
				} else if (formula[i] === ')') {
					if (unclosedBrackets === 0) {
						break;
					} else {
						unclosedBrackets--;
					}
				}

				i++;
			}

			return formula.substring(operatorIndex + 1, i);
		}

		function calculateFormula(formulaKey, subforms, interpretationLine) {
			let result;

			if (isConstant(formulaKey)) {
				result = Number(formulaKey);
			} else if (isAtom(formulaKey)) {
				result = interpretationLine[formulaKey];
			} else {
				let currentSubform = subforms[formulaKey];
				result = performOperation(currentSubform, subforms, interpretationLine);
			}

			return result;
		}

		function isConstant(formula) {
			return formula === "1" || formula === "0";
		}

		function isAtom(formula) {
			let unaryComplexPat = /^[A-Z]+\d*$/;
			return unaryComplexPat.test(formula);
		}

		function performOperation(currentSubform, subforms, interpretationLine) {
			let result;

			switch (currentSubform.operator) {
				case '!':
					result = negation(calculateFormula(currentSubform["operand"], subforms, interpretationLine));
					break;
				case '|':
					result = calculateFormula(currentSubform["first operand"], subforms, interpretationLine)
						| calculateFormula(currentSubform["second operand"], subforms, interpretationLine);
					break;
				case '&':
					result = calculateFormula(currentSubform["first operand"], subforms, interpretationLine)
						& calculateFormula(currentSubform["second operand"], subforms, interpretationLine);
					break;
				case '~':
					result = equivalence(calculateFormula(currentSubform["first operand"], subforms, interpretationLine),
						calculateFormula(currentSubform["second operand"], subforms, interpretationLine));
					break;
				case "->":
					result = implication(calculateFormula(currentSubform["first operand"], subforms, interpretationLine),
						calculateFormula(currentSubform["second operand"], subforms, interpretationLine));
					break;
			}

			return result;
		}

		function equivalence(firstOperand, secondOperand) {
			let result;

			if (firstOperand === secondOperand) {
				result = 1;
			} else {
				result = 0;
			}

			return result;
		}

		function implication(firstOperand, secondOperand) {
			return negation(firstOperand) | secondOperand;
		}

		function negation(operand) {
			let result;

			if (operand === 1) {
				result = 0;
			} else {
				result = 1;
			}

			return result;
		}

		function buildConjunctionOfDisjuncts(interpretation, truthTable) {
			let conjunctionOfDisjuncts = "";

			let disjuncts = buildAllDisjuncts(interpretation, truthTable);
			let disjunctsNumber = disjuncts.length;
			for (let i = 0; i < disjunctsNumber; i++) {
				if (i > 0 && i !== disjunctsNumber - 1) {
					conjunctionOfDisjuncts += "&(";
				} else if (i > 0 && i === disjunctsNumber - 1) {
					conjunctionOfDisjuncts += '&';
				}

				conjunctionOfDisjuncts += disjuncts[i];
			}

			return addOtherBrackets(conjunctionOfDisjuncts, disjunctsNumber);
		}

		function buildAllDisjuncts(interpretation, truthTable) {
			let disjuncts = [];

			let linesNumber = interpretation.length;

			for (let i = 0; i < linesNumber; i++) {
				if (truthTable[i] === 0) {
					disjuncts.push(convertToDisjunct(interpretation[i]));
				}
			}

			return disjuncts;
		}

		function convertToDisjunct(interpretationLine) {
			let disjunct = "";

			let atoms = Object.keys(interpretationLine);
			let atomsNumber = atoms.length;
			for (let i = 0; i < atomsNumber; i++) {
				if (i > 0 && i !== atomsNumber - 1) {
					disjunct += "|(";
				} else if (i > 0 && i === atomsNumber - 1) {
					disjunct += '|';
				}

				let key = atoms[i];
				if (interpretationLine[key] === 0) {
					disjunct += key;
				} else {
					disjunct += "(!" + key + ")";
				}
			}

			return addOtherBrackets(disjunct, atomsNumber);
		}

		function addOtherBrackets(formulaPart, subformsNumber) {
			for (let i = 0; i < subformsNumber - 2; i++) {
				formulaPart += ')';
			}

			if (subformsNumber > 1) {
				formulaPart = '(' + formulaPart + ')';
			}

			return formulaPart;
		}
	}