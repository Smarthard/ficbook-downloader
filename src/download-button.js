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

function initDownloadFicButton(onClickFunc) {
   const downloadFicsButton = document.createElement('button');

   downloadFicsButton.classList.add('btn', 'btn-default');
   downloadFicsButton.type = 'button'; // prevent search form from submitting
   downloadFicsButton.textContent = 'Скачать'; // TODO: should be localized
   downloadFicsButton.onclick = onClickFunc;

   return downloadFicsButton;
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

        const onDownloadClick = async () => {
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
                            const fileExt = 'fb2';
                            const blob = await getFicDataById(ficId, ficName);
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

        const downloadFicsButton = initDownloadFicButton(onDownloadClick);

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
