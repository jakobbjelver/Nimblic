import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faFloppyDisk, faCode } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useModal } from './Modal/ModalContext';
import ReactMarkdown from 'react-markdown';
import { SettingsContext } from '../Settings/SettingsContext';
import { ExclamationCircleIcon, InformationCircleIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { dracula as darkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ThemeContext from '../general/Theme/ThemeContext';
import { useNavigate } from 'react-router-dom';

const CardMenu = ({ cardId, codeFile, cardRef }) => {
  const { settings } = useContext(SettingsContext);
  const [error, setError] = useState(null);
  const { openModal, setModalActions } = useModal();
  const { theme } = useContext(ThemeContext); // Use the context
  const navigate = useNavigate();

  const updateModalContent = (contentType, content, title, state) => {
    let modalContent;
    if (state == 'loading') {

      modalContent = (
        <div className="flex items-center justify-center w-[455px] mt-60 h-max">
          <div className="loading loading-spinner loading-lg text-neutral-content/70"></div>
        </div>
      );
    } else if (state == 'error') {
      let text;
      let message;

      if (!error) {
        message = "Content not found"
        text = "This content does not exist yet"
      } else {
        message = error.message
        text = error.text
      }

      modalContent = (
        <div className="flex flex-col items-center justify-center w-[455px] mt-60 h-max">
          <div className="flex flex-row items-center justify-center gap-1 mr-5">
            <ExclamationCircleIcon className="h-5 w-5 text-error" aria-hidden="true" />
            <p className="text-lg font-semibold">{text}</p>
          </div>
          <p className="text-sm font-light">{message}</p>
        </div>

      );
    } else {
      modalContent = contentType === 'info' ?
        <ReactMarkdown>{content}</ReactMarkdown>
        :
        <div className="text-sm bg-transparent">
          <SyntaxHighlighter wrapLongLines={true} language="python" style={theme === 'dark' ? darkTheme : lightTheme}>{content}</SyntaxHighlighter>
        </div>
    }

    openModal(
      <div className="flex flex-col w-full h-full">
        <h3 className="font-bold text-2xl ml-4">{content ? title : ''}</h3>
        <div className="h-[500px] overflow-auto mt-2 mb-0 info-explanation">
          <div className="mb-10 mx-4">
            {modalContent}
          </div>
        </div>
      </div>,
      contentType === 'info' ? handleViewCode : handleViewGithub
    );
  };

  const loadInfoContent = async () => {
    setError(null);
    updateModalContent('info', null, null, 'loading');

    let skillLevel = '1';
    switch (settings?.skillLevel) {
      case 'beginner':
        skillLevel = '1';
        break;
      case 'intermediate':
        skillLevel = '2';
        break;
      case 'expert':
        skillLevel = '3';
        break;
      default:
        skillLevel = '1';
    }

    try {
      let cardAddress = cardId.split("_");
      const contentPath = `/content/info_explanation/${cardAddress[0]}/${cardAddress[1]}${cardAddress[2] ? '/' + cardAddress[2] : ''}_${skillLevel}.md`;
      const response = await fetch(contentPath);
      if (!response.ok) {
        throw new Error(`Error loading content. Status: ${response.status}`);
      }
      const text = await response.text();
      const headerLineBreak = text.indexOf('\n');
      const headerLine = text.substring(0, headerLineBreak).trim();
      const restOfContent = text.substring(headerLineBreak).trim();

      updateModalContent('info', restOfContent, headerLine, 'show');
    } catch (error) {
      error.text = 'This content does not exist yet'
      setError(error);
      updateModalContent('info', null, null, 'error');
    }
  };

  const loadCodeContent = async () => {
    setError(null);
    updateModalContent('code', null, codeFile, 'loading');

    try {
      const apiUrl = `https://api.github.com/repos/jakobbjelver/Nimblic/contents/backend/data_processor/${codeFile}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.content) {
        const code = atob(data.content); // Decodes the base64 encoded content
        updateModalContent('code', code, codeFile, 'show');
      } else {
        throw new Error('No content found in the file');
      }
    } catch (error) {
      error.text = 'This code is not available'
      setError(error);
      updateModalContent('code', null, null, 'error');
    }
  };

  const handleOpenInfo = async () => {
    setModalActions(['Close', <div><FontAwesomeIcon icon={faCode} className="mr-2" />View code</div>]);
    await loadInfoContent();
  };

  const handleViewCode = async () => {
    setModalActions(['Close', <div><FontAwesomeIcon icon={faGithub} className="mr-2" />GitHub</div>]);
    await loadCodeContent();
  };

  const handleViewGithub = () => {
    window.location.href = `https://github.com/jakobbjelver/Nimblic/tree/main/backend/data_processor/${codeFile}`
  }

  return (
    <div className="flex flex-row items-center">
      <div className="btn btn-ghost btn-circle btn-sm" onClick={handleOpenInfo}>
        <InformationCircleIcon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div className="btn btn-ghost btn-circle btn-sm" onClick={handleViewCode}>
        <CodeBracketIcon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
    </div>
  );
};

export default CardMenu;
