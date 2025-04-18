document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    const logoutForm = document.getElementById('logoutForm');

    logoutButton.addEventListener('click', function () {
        logoutForm.submit();
    });
});