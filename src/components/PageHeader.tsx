import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, rightSlot }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {rightSlot ? (
        <div className="w-full sm:w-auto">
          {rightSlot}
        </div>
      ) : null}
    </div>
  );
};

export default PageHeader;


