import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline'

const ChatBar = () => {
  return (
    <div className="flex-1 ml-12">
    <div className="form-control flex items-center relative">
      <input type="text" placeholder="Ask AI" className="input input-bordered w-72" readOnly/>
      <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 absolute right-3 top-3 text-primary" aria-hidden="true" />
      <span className="badge badge-md badge-outline badge-primary absolute right-10 top-4"><p className="text-sans font-semibold text-xs">COMING SOON</p></span>

    </div>
  </div>
  );
};

export default ChatBar;

