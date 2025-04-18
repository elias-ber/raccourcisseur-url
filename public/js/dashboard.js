document.addEventListener('DOMContentLoaded', function () {
    const urlModalBackdrop = document.getElementById('urlModalBackdrop');
    const urlModal = document.getElementById('urlModal');
    const closeModal = document.getElementById('closeModal');
    const closeModalFooter = document.getElementById('closeModalFooter');
    const qrModalBackdrop = document.getElementById('qrModalBackdrop');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const closeQrModalFooter = document.getElementById('closeQrModalFooter');
    const deleteSelected = document.getElementById('deleteSelected');
    const selectAll = document.getElementById('selectAll');
    const expirationSelect = document.getElementById('expiration');
    const customExpirationRow = document.getElementById('customExpirationRow');
    const customExpirationDate = document.getElementById('customExpirationDate');
    const customExpirationTime = document.getElementById('customExpirationTime');

    function showModal(modal, backdrop) {
        modal.style.display = 'block';
        backdrop.style.display = 'flex';
    }

    function hideModal(modal, backdrop) {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    }

    function updateDeleteButtonState() {
        const selectedRows = document.querySelectorAll('.row-select:checked');
        deleteSelected.disabled = selectedRows.length === 0;
    }

    function loadUrlStats(id) {
        fetch(`/links/${id}/stats`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const clicksTableBody = document.getElementById('clicksTableBody');
                    clicksTableBody.innerHTML = data.clicksByDate.map(item => `
                        <tr>
                            <td>${item.date}</td>
                            <td>${item.clicks.length}</td>
                        </tr>
                    `).join('');

                    const hourlyClicksTableBody = document.getElementById('hourlyClicksTableBody');
                    hourlyClicksTableBody.innerHTML = data.clicksByDate.flatMap(item =>
                        item.clicks.map(click => `
                            <tr>
                                <td>${click.visited_at.split('T')[0]}</td>
                                <td>${click.visited_at.split('T')[1].split('.')[0]}</td>
                            </tr>
                        `)
                    ).join('');

                    const ipTableBody = document.getElementById('ipTableBody');
                    ipTableBody.innerHTML = data.clicksByIp.map(item => `
                        <tr>
                            <td>${item.ip}</td>
                            <td>${item.clicks}</td>
                        </tr>
                    `).join('');
                } else {
                    alert('Erreur lors du chargement des statistiques');
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement des statistiques:', error);
                alert('Erreur lors du chargement des statistiques');
            });
    }

    function generateQrCode(url) {
        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: url,
            width: 200,
            height: 200,
        });

        document.getElementById('downloadQrCode').addEventListener('click', function () {
            const qrCodeCanvas = qrContainer.querySelector('canvas');
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qrCodeCanvas.toDataURL();
            link.click();
        });
    }

    closeModal.addEventListener('click', function () {
        hideModal(urlModal, urlModalBackdrop);
    });

    closeModalFooter.addEventListener('click', function () {
        hideModal(urlModal, urlModalBackdrop);
    });

    closeQrModal.addEventListener('click', function () {
        hideModal(qrModal, qrModalBackdrop);
    });

    closeQrModalFooter.addEventListener('click', function () {
        hideModal(qrModal, qrModalBackdrop);
    });

    deleteSelected.addEventListener('click', function () {
        const selectedRows = document.querySelectorAll('.row-select:checked');
        const ids = Array.from(selectedRows).map(row => row.closest('tr').dataset.id);
        if (ids.length > 0) {
            fetch('/links/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            }).then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                if (!response.ok) {
                    return response.json().then(errorData => {
                        console.error('Error data:', errorData);
                        throw new Error(errorData.message || 'Erreur lors de la suppression des URLs');
                    });
                }
                return response.json();
            })
                .then(data => {
                    console.log('Success data:', data);
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Erreur lors de la suppression des URLs');
                    }
                }).catch(error => {
                    console.error('Erreur lors de la requête:', error);
                    alert(error.message);
                });
        }
    });

    selectAll.addEventListener('change', function () {
        const rows = document.querySelectorAll('.row-select');
        rows.forEach(row => {
            row.checked = selectAll.checked;
        });
        updateDeleteButtonState();
    });

    document.querySelectorAll('.row-select').forEach(row => {
        row.addEventListener('change', updateDeleteButtonState);
    });

    document.querySelectorAll('.url-row').forEach(row => {
        row.addEventListener('click', function (e) {
            if (!e.target.closest('.action-buttons')) {
                const url = row.querySelector('a').textContent;
                document.getElementById('modalTitle').textContent = `Statistiques pour ${url}`;
                showModal(urlModal, urlModalBackdrop);
                loadUrlStats(row.dataset.id);
            }
        });
    });

    document.querySelectorAll('.qr-button').forEach(button => {
        button.addEventListener('click', function () {
            const shortId = button.dataset.url;
            const url = `http://localhost:3000/${shortId}`;
            document.getElementById('qrModalTitle').textContent = `QR Code pour ${shortId}`;
            showModal(qrModal, qrModalBackdrop);
            generateQrCode(url);
        });
    });

    document.querySelectorAll('.stats-button').forEach(button => {
        button.addEventListener('click', function () {
            const id = button.dataset.id;
            document.getElementById('modalTitle').textContent = `Statistiques pour l'URL ID ${id}`;
            showModal(urlModal, urlModalBackdrop);
            loadUrlStats(id);
        });
    });

    expirationSelect.addEventListener('change', function () {
        if (expirationSelect.value === 'custom') {
            customExpirationRow.style.display = 'flex';
            customExpirationDate.value = '';
            customExpirationTime.value = '';
        } else {
            customExpirationRow.style.display = 'none';
        }
    });

    document.getElementById('shortenForm').addEventListener('submit', function (e) {
        if (expirationSelect.value === 'custom') {
            const selectedDate = new Date(customExpirationDate.value);
            const selectedTime = customExpirationTime.value.split(':');
            selectedDate.setHours(selectedTime[0], selectedTime[1]);

            const currentDate = new Date();
            if (selectedDate <= currentDate) {
                e.preventDefault();
                alert('Veuillez sélectionner une date et une heure futures.');
            }
        }
    });
});
