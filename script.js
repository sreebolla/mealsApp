window.onload = () => {
    const searchBtn = document.getElementById('search-btn');
    const mealList = document.getElementById('meal');
    const mealDetailsContent = document.querySelector('.meal-details-content');
    const recipeCloseBtn = document.getElementById('recipe-cls-btn');
    const favBtn = document.querySelector('.fa-heart');
    const favLightBox = document.querySelector('#fav-light-box');
    const closeFavList = document.querySelector("#fav-light-box > span a");


    // this is where we are wirting the code related to favorite list
    let favMeals = [];

    favBtn.addEventListener('click', () => {
        favLightBox.classList.add('active');
    });

    closeFavList.addEventListener('click', () => {
        favLightBox.classList.remove('active');
    });
// updating favlist
    function updateFavoriteList() {
        let favMealContainer = document.querySelector('.fav-container');
        favMealContainer.innerHTML = "";

        favMeals.forEach((meal) => {
            let favMealList = document.createElement('li');
            favMealList.classList.add('fav-meal-list');
            favMealList.innerHTML = `
                <img src="${meal.img}" alt="meal-image">
                <p>${meal.name}</p>
            `;

            // Adding a delete button for the list
            const deleteBtn = document.createElement('span');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.classList.add('delete-button');
            favMealList.appendChild(deleteBtn);

            deleteBtn.addEventListener("click", () => {
                const mealIndex = favMeals.indexOf(meal);
                if (mealIndex !== -1) {
                    favMeals.splice(mealIndex, 1);
                    localStorage.setItem('favMeals', JSON.stringify(favMeals));
                    updateFavoriteList();
                }
            });

            favMealContainer.appendChild(favMealList);
        });
    }
// storing the meals in favorites
    function getStoredFavoriteMeals() {
        const storedMeals = localStorage.getItem('favMeals');
        if (storedMeals) {
            return JSON.parse(storedMeals);
        } else {
            return [];
        }
    }
// adding event listeners to searchbtn and get recipe
    searchBtn.addEventListener('click', getMealList);
    mealList.addEventListener('click', getMealRecipe);
    recipeCloseBtn.addEventListener('click', () => {
        mealDetailsContent.parentElement.classList.remove('showRecipe');
    });
// here is the piece of code to get the meals as soon as we search
    function getMealList() {
        let searchInputTxt = document.getElementById('search-input').value.trim();
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
            .then(Response => Response.json())
            .then(data => {
                let html = "";
                if (data.meals) {
                    data.meals.forEach(meal => {
                        mealData = {
                            id: meal.idMeal,
                            name: meal.strMeal,
                            img: meal.strMealThumb
                        };
                        html += `
                            <div class="meal-item" data-id="${mealData.id}">
                                <div class="meal-img">
                                    <img src="${mealData.img}" alt="food-image">
                                </div>
                                <div class="meal-name">
                                    <h3>${mealData.name}</h3>
                                    <a href="#" class="recipe-btn">Get Recipe</a>
                                    <i class="fas fa-heart" id="fav-add-btn">ADD</i>
                                </div>
                            </div>
                        `;
                    });
                    mealList.classList.remove('notFound');
                } else {
                    html = "Sorry, we didn't find any meal....😔";
                    mealList.classList.add('notFound');
                }
// this code is related to adding meals to favorite list as we click on add 
                mealList.innerHTML = html;
                const addBtns = document.querySelectorAll('.meal-name .fa-heart');
                addBtns.forEach(addBtn => {
                    addBtn.addEventListener('click', () => {
                        const mealItem = addBtn.parentElement.parentElement;
                        const mealId = mealItem.getAttribute('data-id');
                        const selectedMeal = data.meals.find(meal => meal.idMeal === mealId);
                        if (selectedMeal) {
                            const mealData = {
                                id: selectedMeal.idMeal,
                                name: selectedMeal.strMeal,
                                img: selectedMeal.strMealThumb
                            };
                            favMeals.push(mealData);
                            localStorage.setItem('favMeals', JSON.stringify(favMeals));
                            updateFavoriteList();
                        }
                    });
                });
            });
    }
// clicking on getrecipe btn the meal recipe will be showed
    function getMealRecipe(e) {
        e.preventDefault();
        if (e.target.classList.contains('recipe-btn')) {
            let mealItem = e.target.parentElement.parentElement;
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.getAttribute('data-id')}`)
                .then(Response => Response.json())
                .then(data => mealRecipeModal(data.meals[0]));
        }
    }

    function mealRecipeModal(meal) {
        let html = `
            <h2 class="recipe-title">${meal.strMeal}</h2>
            <p class="recipe-category">${meal.strCategory}</p>
            <div class="recipe-instruct">
                <h3>Instructions:</h3>
                <p>${meal.strInstructions}</p>
            </div>
            <div class="recipe-meal-img">
                <img src="${meal.strMealThumb}" alt="food">
            </div>
            <div class="recipe-link">
                <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
            </div>
        `;
        mealDetailsContent.innerHTML = html;
        mealDetailsContent.parentElement.classList.add('showRecipe');
    }

    // Initialize favMeals with stored favorites when the page loads
    favMeals = getStoredFavoriteMeals();
    updateFavoriteList();
};
