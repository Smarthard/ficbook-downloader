import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import * as toastr from 'toastr';

import { getEntityIdFromUrl, trimDots } from './helpers';
import { getFicDataById, getFicIdsAndNamesByAuthorId } from './helpers/page-loaders';
import {
    getAdvancedSearchLink,
    getAuthorName,
    getFicFiltersContainer,
    getTotalFics,
    isUserLoggedIn,
} from './helpers/dom-parsers';

function initDownloadFicButton(onClickFuncGenerator) {
   const downloadFicsDropdownContainer = document.createElement('div');
   const toggleButton = document.createElement('button');
   const toggleButtonId = 'toggleButton';
   const downloadMenuContainer = document.createElement('ul');
   const downloadTypes = [ 'txt', 'epub', 'pdf', 'fb2' ];
   const menuButtons = downloadTypes.map(() => document.createElement('li'));

   for (const [ index, menuBtn ] of menuButtons.entries()) {
       const fileExt = downloadTypes[index];
       menuBtn.textContent = `...в ${fileExt}`;
       menuBtn.classList.add('download-fics-dropdown__item');
       menuBtn.onclick = onClickFuncGenerator(fileExt);

       downloadMenuContainer.appendChild(menuBtn);
   }

   downloadFicsDropdownContainer.classList.add('dropdown', 'download-fics-dropdown');

   downloadMenuContainer.classList.add('dropdown-menu', 'list-unstyled');
   downloadMenuContainer.setAttribute('aria-labelledby', toggleButtonId);

   toggleButton.type = 'button';
   toggleButton.id = toggleButtonId;
   toggleButton.classList.add('btn', 'btn-default');
   toggleButton.setAttribute('data-toggle', 'dropdown');
   toggleButton.setAttribute('aria-expanded', 'false');
   toggleButton.innerHTML = 'Скачать <span class="caret"></span>'; // TODO: should be localized

   downloadFicsDropdownContainer.appendChild(toggleButton);
   downloadFicsDropdownContainer.appendChild(downloadMenuContainer);

   return downloadFicsDropdownContainer;
}

function main() {
    const filtersContainerForm = getFicFiltersContainer();

    // skip download button initialization if wrong page
    if (filtersContainerForm) {
        const authorId = getEntityIdFromUrl(window.location);
        const authorName = getAuthorName();
        const totalFics = getTotalFics();
        const advancedFiltersDiv = getAdvancedSearchLink();
        const isLoggedIn = isUserLoggedIn();

        const onDownloadClickGenerator = (fileExt) => async () => {
            let timeoutMs = 0;
            let ficsDownloaded = 0;
            const jobs = [];
            const zip = new JSZip();
            const ficIdsAndNames = await getFicIdsAndNamesByAuthorId(authorId, totalFics);
            // TODO: should be localized
            const toast = toastr.info(
                `Готово ${ficsDownloaded} из ${totalFics}`,
                'Начинаем загрузку работ...',
                { timeOut: 0 },
            );

            for (const [ ficId, ficName ] of ficIdsAndNames) {
                const job = new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const blob = await getFicDataById(ficId, ficName, fileExt);
                            const fileName = `[${authorName}] ${trimDots(ficName)}.${fileExt}`;

                            zip.file(fileName, blob);
                            ficsDownloaded++;
                            // TODO: should be localized
                            toast.find('.toast-message').text(`Готово ${ficsDownloaded} из ${totalFics}`);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    }, timeoutMs);
                    timeoutMs += 5000;
                });

                jobs.push(job);
            }

            Promise.all(jobs)
                .then(() => toastr.clear())
                .then(() => zip.generateAsync({ type : 'blob' }))
                .then((generatedZip) => saveAs(generatedZip, `${authorName}.zip`))
                .catch((err) => console.error(err));
        };

        const downloadFicsButton = initDownloadFicButton(onDownloadClickGenerator);

        if (!totalFics || !isLoggedIn) {
            downloadFicsButton.disabled = true;
        }

        if (!isLoggedIn) {
            // TODO: should be localized
            downloadFicsButton.title = 'Необходимо войти в аккаунт для скачивания';
        }

        filtersContainerForm.insertBefore(downloadFicsButton, advancedFiltersDiv);
    }
}

try {
    main();
} catch (e) {
    console.warn(e);
}
