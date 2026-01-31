import React from 'react';

interface CharacterAvatarProps {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
}

export default function CharacterAvatar({ 
  skinColor = '#FDBCB4', 
  hairColor = '#8B4513', 
  hairStyle = 'Short', 
  eyeColor = '#8B4513' 
}: CharacterAvatarProps) {
  
  const renderHair = () => {
    if (hairStyle === 'Bald') return null;

    if (hairStyle === 'Buzz Cut') {
      return (
        <div 
          className="absolute z-10 rounded-full"
          style={{
            top: '5px',
            left: '8px',
            right: '8px',
            height: '18px',
            backgroundColor: hairColor,
            borderRadius: '9px'
          }}
        />
      );
    }

    if (hairStyle === 'Pixie') {
      return (
        <div 
          className="absolute z-10"
          style={{
            top: '-1px',
            left: '7px',
            right: '7px',
            height: '21px',
            backgroundColor: hairColor,
            borderTopLeftRadius: '25px',
            borderTopRightRadius: '25px'
          }}
        />
      );
    }

    if (hairStyle === 'Spiky') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div className="absolute z-10 w-[5px] h-[11px] rounded-[3px] -top-[4px]" style={{ backgroundColor: hairColor, left: '12px', transform: 'rotate(-18deg)' }} />
          <div className="absolute z-10 w-[5px] h-[11px] rounded-[3px] -top-[4px]" style={{ backgroundColor: hairColor, left: '25px', transform: 'rotate(8deg)' }} />
          <div className="absolute z-10 w-[5px] h-[11px] rounded-[3px] -top-[4px]" style={{ backgroundColor: hairColor, right: '12px', transform: 'rotate(18deg)' }} />
        </>
      );
    }

    if (hairStyle === 'Wavy') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div className="absolute z-10 w-[9px] h-[9px] rounded-full top-[8px]" style={{ backgroundColor: hairColor, left: '9px' }} />
          <div className="absolute z-10 w-[9px] h-[9px] rounded-full top-[8px]" style={{ backgroundColor: hairColor, left: '24px' }} />
          <div className="absolute z-10 w-[9px] h-[9px] rounded-full top-[8px]" style={{ backgroundColor: hairColor, right: '9px' }} />
        </>
      );
    }

    if (hairStyle === 'Curly') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div className="absolute z-10 w-[7px] h-[7px] rounded-full top-[10px]" style={{ backgroundColor: hairColor, left: '7px' }} />
          <div className="absolute z-10 w-[7px] h-[7px] rounded-full top-[10px]" style={{ backgroundColor: hairColor, left: '18px' }} />
          <div className="absolute z-10 w-[7px] h-[7px] rounded-full top-[10px]" style={{ backgroundColor: hairColor, right: '18px' }} />
          <div className="absolute z-10 w-[7px] h-[7px] rounded-full top-[10px]" style={{ backgroundColor: hairColor, right: '7px' }} />
        </>
      );
    }

    if (hairStyle === 'Long') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-0"
            style={{
              top: '22px',
              left: '4px',
              right: '4px',
              height: '26px',
              backgroundColor: hairColor,
              borderBottomLeftRadius: '13px',
              borderBottomRightRadius: '13px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              left: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px'
            }}
          />
        </>
      );
    }

    if (hairStyle === 'Bob') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-0"
            style={{
              top: '22px',
              left: '6px',
              right: '6px',
              height: '18px',
              backgroundColor: hairColor,
              borderBottomLeftRadius: '9px',
              borderBottomRightRadius: '9px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              left: '4px',
              top: '20px',
              width: '8px',
              height: '15px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '5px',
              borderBottomLeftRadius: '5px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '4px',
              top: '20px',
              width: '8px',
              height: '15px',
              backgroundColor: hairColor,
              borderTopRightRadius: '5px',
              borderBottomRightRadius: '5px'
            }}
          />
        </>
      );
    }

    if (hairStyle === 'Straight') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-0"
            style={{
              top: '21px',
              left: '5px',
              right: '5px',
              height: '28px',
              backgroundColor: hairColor,
              borderBottomLeftRadius: '13px',
              borderBottomRightRadius: '13px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              left: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '2px',
              top: '19px',
              width: '9px',
              height: '23px',
              backgroundColor: hairColor,
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px'
            }}
          />
        </>
      );
    }

    if (hairStyle === 'Braided') {
      return (
        <>
          <div 
            className="absolute z-10"
            style={{
              top: '-3px',
              left: '5px',
              right: '5px',
              height: '27.5px',
              backgroundColor: hairColor,
              borderTopLeftRadius: '30px',
              borderTopRightRadius: '30px'
            }}
          />
          <div 
            className="absolute z-20"
            style={{
              right: '9px',
              top: '23px',
              width: '7px',
              height: '23px',
              backgroundColor: hairColor,
              borderRadius: '3.5px'
            }}
          />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[25px]" style={{ backgroundColor: hairColor }} />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[31px]" style={{ backgroundColor: hairColor }} />
          <div className="absolute z-20 w-[7px] h-[5px] rounded-[2.5px] right-[9px] top-[37px]" style={{ backgroundColor: hairColor }} />
        </>
      );
    }

    // Default Short
    return (
      <>
        <div 
          className="absolute z-10"
          style={{
            top: '-3px',
            left: '5px',
            right: '5px',
            height: '27.5px',
            backgroundColor: hairColor,
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px'
          }}
        />
        <div 
          className="absolute z-10"
          style={{
            top: '16px',
            left: '12px',
            width: '18px',
            height: '7px',
            backgroundColor: hairColor,
            borderRadius: '4px'
          }}
        />
      </>
    );
  };

  return (
    <div className="relative w-[80px] h-[80px] rounded-full flex justify-center items-center shadow-md bg-[rgba(255,255,255,0.12)]"
         style={{ boxShadow: '0 3px 5px rgba(0,0,0,0.25)' }}>
      <div 
        className="relative w-[60px] h-[60px] rounded-full flex flex-col justify-center items-center"
        style={{ backgroundColor: skinColor }}
      >
        {renderHair()}
        <div className="flex gap-2 z-20 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eyeColor }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eyeColor }} />
        </div>
        <div className="w-[14px] h-[2px] rounded-[1px] bg-[rgba(0,0,0,0.2)] mt-[5px] z-20" />
      </div>
    </div>
  );
}
