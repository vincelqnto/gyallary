const imageInput = document.getElementById('imageInput');
            const previewContainer = document.getElementById("preview");
            
            const savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];

            function renderImages(images) {
                previewContainer.innerHTML = '';
                images.forEach((imageData, idx) => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.classList.add('image-wrapper');
                    imgWrapper.draggable = true;
                    imgWrapper.dataset.idx = idx;

                    const img = document.createElement('img');
                    img.src = imageData;
                    img.style.display = 'block';
                    imgWrapper.appendChild(img);

                    // Click to view original size
                    imgWrapper.addEventListener('click', function(e) {
                        document.getElementById('modal-img').src = imageData;
                        document.getElementById('modal').style.display = 'flex';
                        modalCurrentIdx = idx;
                        // Add action buttons
                        const actions = document.getElementById('modal-actions');
                        actions.innerHTML = '';
                        // Delete button
                        const delBtn = document.createElement('button');
                        delBtn.textContent = 'Delete';
                        delBtn.classList.add('delete-btn');
                        delBtn.onclick = function(ev) {
                            ev.stopPropagation();
                            images.splice(idx, 1);
                            localStorage.setItem('savedImages', JSON.stringify(images));
                            document.getElementById('modal').style.display = 'none';
                            renderImages(images);
                        };
                        actions.appendChild(delBtn);
                        // Save button
                        const saveBtn = document.createElement('button');
                        saveBtn.textContent = 'Save';
                        saveBtn.classList.add('save-btn');
                        saveBtn.onclick = function(ev) {
                            ev.stopPropagation();
                            const a = document.createElement('a');
                            a.href = imageData;
                            a.download = 'image.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        };
                        actions.appendChild(saveBtn);
                    });

                    // Drag events
                    let currentDragImg = null;

                    imgWrapper.addEventListener('dragstart', function(e) {
                        e.dataTransfer.setData('text/plain', idx);
                        // Custom drag image
                        const dragImg = img.cloneNode();
                        dragImg.style.width = '120px';
                        dragImg.style.height = 'auto';
                        dragImg.style.borderRadius = '16px';
                        dragImg.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.15)';
                        dragImg.style.opacity = '0.85';
                        dragImg.style.position = 'absolute';
                        dragImg.style.top = '-9999px';
                        dragImg.style.left = '-9999px';
                        document.body.appendChild(dragImg);
                        e.dataTransfer.setDragImage(dragImg, 60, 60);
                        currentDragImg = dragImg;
                        setTimeout(() => imgWrapper.style.opacity = '0.5', 0);
                    });
                    imgWrapper.addEventListener('dragend', function(e) {
                        imgWrapper.style.opacity = '';
                        if (currentDragImg) {
                            currentDragImg.remove();
                            currentDragImg = null;
                        }
                    });
                    imgWrapper.addEventListener('dragover', function(e) {
                        e.preventDefault();
                    });
                    imgWrapper.addEventListener('drop', function(e) {
                        e.preventDefault();
                        const fromIdx = +e.dataTransfer.getData('text/plain');
                        const toIdx = idx;
                        if (fromIdx !== toIdx) {
                            const moved = images.splice(fromIdx, 1)[0];
                            images.splice(toIdx, 0, moved);
                            localStorage.setItem('savedImages', JSON.stringify(images));
                            renderImages(images);
                        }
                    });
                    previewContainer.appendChild(imgWrapper);
                });
            }

            savedImages.forEach(imageData =>{

                const img = document.createElement('img');
                img.src = imageData;
                img.style.maxWidth = '300px';
                img.style.maxHeight = '300px';

                previewContainer.appendChild(img);
    
            });

            renderImages(savedImages);

            document.getElementById('delete-zone').addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.background = '#ff8888';
            });
            document.getElementById('delete-zone').addEventListener('dragleave', function(e) {
                this.style.background = '#ffdddd';
            });
            
            // Add confirmation modal to HTML
const confirmModal = document.createElement('div');
confirmModal.id = 'confirm-modal';
confirmModal.style.display = 'none';
confirmModal.style.position = 'fixed';
confirmModal.style.top = '0';
confirmModal.style.left = '0';
confirmModal.style.width = '100vw';
confirmModal.style.height = '100vh';
confirmModal.style.background = 'rgba(0,0,0,0.5)';
confirmModal.style.zIndex = '2000';
confirmModal.style.alignItems = 'center';
confirmModal.style.justifyContent = 'center';
confirmModal.style.display = 'flex';
confirmModal.innerHTML = `
  <div style="background:#fff; padding:32px 24px; border-radius:16px; box-shadow:0 2px 16px #0002; min-width:260px; text-align:center;">
    <div style="font-size:1.1rem; margin-bottom:18px; color:#222;">Are you sure you want to delete this image?</div>
    <button id="confirm-yes" style="background:#ff4444; color:white; border:none; border-radius:8px; padding:8px 18px; font-size:1rem; margin-right:12px; cursor:pointer;">Yes</button>
    <button id="confirm-no" style="background:#aaa; color:white; border:none; border-radius:8px; padding:8px 18px; font-size:1rem; cursor:pointer;">No</button>
  </div>
`;
document.body.appendChild(confirmModal);
let pendingDeleteIdx = null;

            document.getElementById('delete-zone').addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.background = '#ffdddd';
                const idx = +e.dataTransfer.getData('text/plain');
                pendingDeleteIdx = idx;
                confirmModal.style.display = 'flex';
            });
            document.getElementById('confirm-yes').onclick = function() {
                if (pendingDeleteIdx !== null) {
                    savedImages.splice(pendingDeleteIdx, 1);
                    localStorage.setItem('savedImages', JSON.stringify(savedImages));
                    renderImages(savedImages);
                    pendingDeleteIdx = null;
                }
                confirmModal.style.display = 'none';
            };
            document.getElementById('confirm-no').onclick = function() {
                pendingDeleteIdx = null;
                confirmModal.style.display = 'none';
            };

            imageInput.addEventListener("change", function(){
                const files = Array.from(this.files);
                let newImages = [];
                files.forEach(file =>{
                    const reader = new FileReader();
                    reader.onload = function (e){
                        const imageData = e.target.result;
                        newImages.push(imageData);
                        if(newImages.length === files.length){
                            const allImages = [...savedImages, ...newImages];
                            localStorage.setItem('savedImages', JSON.stringify(allImages));
                            savedImages.splice(0, savedImages.length, ...allImages);
                            renderImages(savedImages);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });
            
            document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this || e.target.id === 'close-modal') {
        this.style.display = 'none';
        document.getElementById('modal-img').src = '';
        document.getElementById('modal-actions').innerHTML = '';
        modalCurrentIdx = null;
    }
});

// Ensure confirm modal is hidden and state reset on page load
window.addEventListener('DOMContentLoaded', function() {
    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) confirmModal.style.display = 'none';
    if (typeof pendingDeleteIdx !== 'undefined') pendingDeleteIdx = null;
});