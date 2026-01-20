import { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({ rating, setRating, readonly = false }: { rating: number, setRating?: (n: number) => void, readonly?: boolean }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    onClick={() => setRating?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                >
                    <Star
                        size={32}
                        className={star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                </button>
            ))}
        </div>
    );
}
