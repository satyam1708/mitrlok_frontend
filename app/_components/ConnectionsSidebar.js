'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

export default function ConnectionsSidebar({
  connections = [],
  selectedUser,
  setSelectedUser,
  setPage,
  setReplyToMessage,
}) {
  return (
    <aside className="w-full md:w-1/3 max-h-[85vh] md:max-h-none border-b md:border-b-0 md:border-r bg-gray-50 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center md:text-left tracking-wide text-blue-800">
        Your Connections
      </h2>

      {connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400 select-none">
          <FiUser size={48} className="mb-2 opacity-40" />
          <p className="text-sm sm:text-base">No connections yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {connections.map((conn) => {
              const isSelected = selectedUser?.id === conn.id;
              return (
                <motion.li
                  key={conn.id}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`group cursor-pointer p-3 rounded-lg flex items-center gap-3 transition duration-200 ${
                    isSelected
                      ? 'bg-blue-200 shadow-inner border border-blue-400'
                      : 'hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    setSelectedUser(conn);
                    setPage(1);
                    setReplyToMessage(null);
                  }}
                  tabIndex={0}
                  aria-label={`Select connection ${conn.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedUser(conn);
                      setPage(1);
                      setReplyToMessage(null);
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
                    {conn.name?.charAt(0) || 'U'}
                  </div>

                  {/* User info */}
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <p className="font-semibold text-blue-800 truncate text-sm sm:text-base">
                      {conn.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {conn.profession || 'N/A'}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </aside>
  );
}
