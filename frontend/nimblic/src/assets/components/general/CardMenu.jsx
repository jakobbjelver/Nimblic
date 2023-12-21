import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faFloppyDisk, faCode } from '@fortawesome/free-solid-svg-icons';
import { useModal } from './Modal/ModalContext';
import ReactMarkdown from 'react-markdown';
import { SettingsContext } from '../Settings/SettingsContext';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import remarkBreaks from 'remark-breaks';

const CardMenu = ({ cardId }) => {
  const { settings } = useContext(SettingsContext);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { openModal, closeModal, setModalActions, updateModalContent } = useModal();

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    let skillLevel = '1'
    switch (settings?.skillLevel) {
      case 'beginner':
        skillLevel = '1'
        break;
      case 'intermediate':
        skillLevel = '2'
        break;
      case 'expert':
        skillLevel = '3'
        break;
      default:
        skillLevel = '1'
    }

    try {
      let cardAddress = cardId.split("_")
      const contentPath = `/content/info_explanation/${cardAddress[0]}/${cardAddress[1]}${cardAddress[2] ? '/' + cardAddress[2] : ''}_${skillLevel}.md`;
      const response = await fetch(contentPath);

      if (!response.ok) {
        throw new Error(`Error loading content. Status: ${response.status}`);
      }

      const text = await response.text();
      const firstLineBreak = text.indexOf('\n');
      const firstLine = text.substring(0, firstLineBreak).trim();
      const restOfContent = text.substring(firstLineBreak).trim();

      setTitle(firstLine);
      setContent(restOfContent);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCode = () => {
    console.log("Viewing code");
  };

  useEffect(() => {
    updateModalContent(
      <div>
        {loading ? (
          <div className="skeleton bg-base-200 my-8 flex items-center justify-center h-[200px] w-[480px]">
            <div className="loading loading-spinner loading-lg text-neutral-content/70"></div>
          </div>
        ) : error ? (
          <div className="mt-8 flex flex-col items-center justify-center h-[200px] w-[480px]">
            <h2 className="text-lg font-bold flex flex-row items-center gap-1"><ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />This content does not exist yet</h2>
            <p className="text-sm font-light">{error}</p>
          </div>
        ) : (
          <>
          <h3 className="font-bold text-2xl ml-4 py-2">{title}</h3>
          <div className="h-[500px] overflow-y-auto mt-2 mb-0">
            <div className="pb-8 px-4 text-current info-explanation">
              <ReactMarkdown>
                {content}
                </ReactMarkdown>
            </div>
          </div>
          </>
        )}
      </div>
    );
  }, [content, loading, error]);

  const handleOpenInfo = async () => {
    await loadContent();
    setModalActions(["Close", "View code"]);
    openModal(
      <div>
        {loading ? (
          <div className="skeleton bg-base-200 mt-8 flex items-center justify-center h-[200px] w-[480px]">
            <div className="loading loading-spinner loading-lg text-neutral-content/70"></div>
          </div>
        ) : error ? (
          <div className="mt-8 flex flex-col items-center justify-center h-[200px] w-[480px]">
            <h2 className="text-lg font-bold flex flex-row items-center gap-1"><ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />This content does not exist yet</h2>
            <p className="text-sm font-light">{error}</p>
          </div>
        ) : (
          <>
          <h3 className="font-bold text-2xl">{title}</h3>
          <div className="h-[500px] overflow-y-auto mt-2 mb-0">
            <div className="pb-8 px-4">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
          </>
        )}
      </div>,
      handleViewCode
    );
  };

  return (
    <div className="flex flex-row items-center">
      <div className="btn btn-ghost btn-circle btn-sm" onClick={() => handleOpenInfo()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div className="dropdown dropdown-end">
        <label tabIndex="0" className="btn btn-ghost btn-sm btn-circle">
          <div className="indicator">
            <FontAwesomeIcon icon={faEllipsisVertical} size="lg" />
          </div>
        </label>
        <div tabIndex="0" className="card card-compact dropdown-content w-40 bg-base-300 shadow z-50">
          <ul className="menu bg-base-100 w-40 rounded-box">
            <li><a>View code<FontAwesomeIcon icon={faCode} size="lg" /></a></li>
            <li><a>Save as PNG<FontAwesomeIcon icon={faFloppyDisk} size="lg" /></a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CardMenu;



