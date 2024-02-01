import React, { useEffect, useState, useContext, useRef } from 'react';
import ThemeContext from '../../../general/Theme/ThemeContext';
import Dropdown from '../../../general/Dropdown';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getCurrentTime } from 'src/utils/textFormat';
import { HashLink } from 'react-router-hash-link';

import { SettingsContext } from '../../SettingsContext'
import LocalStorage from './LocalStorage'
import { AlertContext } from '../../../general/Alert/AlertContext';

import { FileUploadContext } from '../../../general/Upload/FileUploadContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const Preferences = () => {
    const { settings, setSettings } = useContext(SettingsContext);
    const [errorMessage, setErrorMessage] = useState(null);
    const { uploadData, isUploading } = useContext(FileUploadContext);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { setSuccessMessage } = useContext(AlertContext);
    var hasSkillLevelChanged = false
    var lastSkillLevel = null



    // Error message handling
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        return () => {

            if (hasSkillLevelChanged) {
                setSuccessMessage({
                    type: "success",
                    short: `Settings saved: Skill level set to ${lastSkillLevel}`,
                    time: getCurrentTime(),
                });
            }
        };
    }, [navigate]); // Depend on navigate to re-run the effect if navigation object changes

    const handleEncryptionChange = (encryption) => {
        setSettings({
            ...settings,
            encryption: encryption,
        });
    };

    const handleSkillLevelChange = (skillLevel) => {
        hasSkillLevelChanged = true
        lastSkillLevel = skillLevel
        setSettings({
            ...settings,
            skillLevel: skillLevel,
        });
    }

    return (
        <>
            <div className="w-full md:max-w-screen-xl overflow-hidden bg-base-100 md:px-12 fadeInUp">
                <div className="flex flex-col md:gap-8 gap-4">
                    <div className="card h-fit bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-md text-neutral-content/90 font-bold font-nunito">SKILL LEVEL</h2>
                            <p className="md:w-[450px]">Provide the app with your current skill level in data analysis in order to tailor the contents to your understanding.</p>
                            <div className="my-8">
                                <div className="flex flex-col md:gap-6 gap-4 md:mt-0 mt-4 items-center justify-center">
                                    <div className="flex flex-row md:w-[480px] w-72 items-center justify-center h-12">
                                        <div className={`settings-beginner z-[2] w-10 h-10 transition-all duration-400 ease-in-out ${settings?.skillLevel === 'beginner' ? 'scale-115 opacity-100' : 'opacity-90 scale-90'}`} />
                                        <div className={`settings-intermediate z-[2] w-10 h-10 transition-all duration-400 ease-in-out ${settings?.skillLevel === 'intermediate' ? 'scale-115 opacity-100' : 'opacity-90 scale-90'}`} />
                                        <div className={`settings-expert z-[2] w-10 h-10 transition-all duration-400 ease-in-out ${settings?.skillLevel === 'expert' ? 'scale-115 opacity-100' : 'opacity-90 scale-90'}`} />                                    </div>
                                    <div className="join">
                                        <input
                                            className="join-item btn btn-sm md:text-sm text-xs bg-base-300 md:w-40 w-24 z-[2]"
                                            type="radio"
                                            name="options"
                                            aria-label="Beginner"
                                            checked={settings?.skillLevel === 'beginner'}
                                            onChange={() => handleSkillLevelChange('beginner')}

                                        />
                                        <input
                                            className="join-item btn btn-sm md:text-sm text-xs bg-base-300 md:w-40 w-24 z-[2]"
                                            type="radio"
                                            name="options"
                                            aria-label="Intermediate"
                                            checked={settings?.skillLevel === 'intermediate'}
                                            onChange={() => handleSkillLevelChange('intermediate')}
                                        />
                                        <input
                                            className="join-item btn btn-sm md:text-sm text-xs bg-base-300 md:w-40 w-24 z-[2]"
                                            type="radio"
                                            name="options"
                                            aria-label="Expert"
                                            checked={settings?.skillLevel === 'expert'}
                                            onChange={() => handleSkillLevelChange('expert')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex xl:flex-row flex-col gap-6 mb-8 xl:items-start lg:items-center justify-evenly">
                        <div className="flex flex-col md:gap-8 gap-4 items-stretch justify-evenly">
                            <div className="flex md:flex-row flex-col md:gap-8 gap-4">
                                <div className="card w-full h-fit bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-md text-neutral-content/90 font-bold font-nunito">THEME</h2>
                                        <p>Change the app's colors and shades used to match your preferences.</p>
                                        <div className="flex flex-col w-full h-full items-center justify-center my-8">
                                            <label className="flex cursor-pointer gap-2 items-center justify-center">
                                                <p className="font-bold text-sm">LIGHT</p>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                                                <input type="checkbox" checked={theme === 'dark'} className="toggle" onChange={toggleTheme} />
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                                <p className="font-bold text-sm">DARK</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="card w-full h-fit bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-md text-neutral-content/50 font-bold font-nunito">
                                            ENCRYPTION
                                            <span className="badge badge-md badge-outline border-accent/50 text-accent/50">
                                                <p className="text-sans font-semibold text-xs whitespace-nowrap">COMING SOON</p></span>
                                        </h2>
                                        <p className="text-neutral-content/50">Enforce your data with extended encryption in a chosen format.</p>
                                        <div className="flex flex-col w-full h-full items-center justify-center py-4">

                                            <Dropdown
                                                items={['Standard', 'AES', 'DES', 'Triple DES', 'RC4']}
                                                selectedItem={settings?.encryption || 'Standard'}
                                                onChange={handleEncryptionChange}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-row flex-col items-center justify-center md:gap-8 gap-4">
                                <HashLink to="/#faq" className="md:w-1/3 w-full max-w-sm">
                                    <div className="btn card w-full h-30 bg-base-200">
                                        <div className="card-body flex flex-row items-center justify-center group">
                                            <FontAwesomeIcon icon={faAddressCard} size="xl" title="About" />
                                            <h2 className="text-lg text-neutral-content/90 font-semibold font-nunito">About</h2>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path></svg>
                                        </div>
                                    </div>
                                </HashLink>

                                <Link to="/data-protection-policy" className="md:w-1/3 w-full max-w-sm">
                                    <div className="btn card w-full h-30 bg-base-200">
                                        <div className="card-body flex flex-row items-center justify-center group">
                                            <FontAwesomeIcon icon={faLock} size="xl" title="Privacy" />
                                            <h2 className="text-lg text-neutral-content/90 font-semibold font-nunito">Privacy</h2>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path></svg>
                                        </div>
                                    </div>
                                </Link>

                                <Link to="https://github.com/jakobbjelver/Nimblic" className="md:w-1/3 w-full max-w-sm">
                                    <div className="btn card w-full h-30 bg-base-200">
                                        <div className="card-body flex flex-row items-center justify-center group">
                                            <FontAwesomeIcon icon={faGithub} size="xl" title="Code" />
                                            <h2 className="text-lg text-neutral-content/90 font-semibold font-nunito">Code</h2>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path></svg>
                                        </div>
                                    </div>
                                </Link>

                            </div>
                        </div>
                        <LocalStorage />
                    </div>
                </div>
            </div >
        </>
    );
};

export default Preferences;

