const storageKey = "_my_recipe_box";
let recipes = JSON.parse(localStorage.getItem(storageKey)) || [
  { name: "Spaghetti", ingredients: ["Pasta", "Tomato Sauce", "Meatballs"] },
  { name: "Fruit Salad", ingredients: ["Apple", "Banana", "Honey"] }
];

const recipeList = document.getElementById('recipe-list');
const modal = document.getElementById('recipeModal');

function init() {
  renderRecipes();
}

function renderRecipes() {
  recipeList.innerHTML = '';
  recipes.forEach((recipe, index) => {
    const item = document.createElement('div');
    item.className = 'recipe-item';
    item.innerHTML = `
      <div class="recipe-header" onclick="toggleRecipe(${index})">${recipe.name}</div>
      <div class="recipe-details" id="details-${index}">
        <h4>Ingredients:</h4>
        <ul>
          ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <button class="btn btn-edit" onclick="editRecipe(${index})">Edit</button>
        <button class="btn btn-delete" onclick="deleteRecipe(${index})">Delete</button>
      </div>
    `;
    recipeList.appendChild(item);
  });
  localStorage.setItem(storageKey, JSON.stringify(recipes));
}

function toggleRecipe(index) {
  const details = document.getElementById(`details-${index}`);
  details.classList.toggle('active');
}

function openModal(index = -1) {
  modal.style.display = 'flex';
  if (index > -1) {
    document.getElementById('modalTitle').innerText = "Edit Recipe";
    document.getElementById('recipeName').value = recipes[index].name;
    document.getElementById('recipeIngredients').value = recipes[index].ingredients.join(', ');
    document.getElementById('editIndex').value = index;
  } else {
    document.getElementById('modalTitle').innerText = "Add New Recipe";
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeIngredients').value = '';
    document.getElementById('editIndex').value = -1;
  }
}

function closeModal() {
  modal.style.display = 'none';
}

function saveRecipe() {
  const name = document.getElementById('recipeName').value;
  const ingredients = document.getElementById('recipeIngredients').value.split(',').map(s => s.trim());
  const index = document.getElementById('editIndex').value;

  if (name && ingredients[0] !== "") {
    if (index > -1) {
      recipes[index] = { name, ingredients };
    } else {
      recipes.push({ name, ingredients });
    }
    renderRecipes();
    closeModal();
  } else {
    alert("Please fill in both name and ingredients!");
  }
}

function editRecipe(index) {
  openModal(index);
}

function deleteRecipe(index) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    recipes.splice(index, 1);
    renderRecipes();
  }
}

init();
