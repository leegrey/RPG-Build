# Table Test

## Poly Die Auto Tables

The following are tests for the `[table_poly]` tag. The die with the best fit will be chosen, based on the number of items in the list. A d100 fallback is used if no better fit it found, and may resort to padding the end of the table with "Roll Again". 

[table_poly:1]
One
Two
Three
[end_table]

[table_poly:1]
One
Two
Three
Four
[end_table]

[table_poly:1]
One
Two
Three
Four
Five 
Six
[end_table]

[table_poly:2]
One
Two
Three
Four
Five 
Six
Seven 
Eight
[end_table]


[table_poly:2]
One
Two
Three
Four
Five 
Six
Seven 
Eight
Nine 
Ten
[end_table]

[table_poly:2]
One
Two
Three
Four
Five 
Six
Seven 
Eight
Nine 
Ten
Eleven
Twelve
[end_table]

[table_poly:2]
One
Two
Three
Four
Five 
Six
Seven 
Eight
Nine 
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Ninteen
Twenty
[end_table]



[table_poly:4]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
Twenty-one
Twenty-two
Twenty-three
Twenty-four
Twenty-five
Twenty-six
Twenty-seven
Twenty-eight
Twenty-nine
Thirty
Thirty-one
Thirty-two
Thirty-three
Thirty-four
Thirty-five
Thirty-six
Thirty-seven
Thirty-eight
Thirty-nine
Forty
Forty-one
Forty-two
Forty-three
Forty-four
Forty-five
Forty-six
Forty-seven
Forty-eight
Forty-nine
Fifty
[end_table]


[table_poly:4]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
Twenty-one
Twenty-two
Twenty-three
Twenty-four
Twenty-five
Twenty-six
Twenty-seven
Twenty-eight
Twenty-nine
Thirty
Thirty-one
Thirty-two
Thirty-three
Thirty-four
Thirty-five
Thirty-six
Thirty-seven
Thirty-eight
Thirty-nine
Forty
Forty-one
Forty-two
Forty-three
Forty-four
Forty-five
Forty-six
Forty-seven
Forty-eight
Forty-nine
Fifty
Fifty-one
Fifty-two
Fifty-three
Fifty-four
Fifty-five
Fifty-six
Fifty-seven
Fifty-eight
Fifty-nine
Sixty
Sixty-one
Sixty-two
Sixty-three
Sixty-four
Sixty-five
Sixty-six
Sixty-seven
Sixty-eight
Sixty-nine
Seventy
Seventy-one
Seventy-two
Seventy-three
Seventy-four
Seventy-five
Seventy-six
Seventy-seven
Seventy-eight
Seventy-nine
Eighty
Eighty-one
Eighty-two
Eighty-three
Eighty-four
Eighty-five
Eighty-six
Eighty-seven
Eighty-eight
Eighty-nine
Ninety
Ninety-one
Ninety-two
Ninety-three
Ninety-four
Ninety-five
Ninety-six
Ninety-seven
Ninety-eight
Ninety-nine
One hundred
[end_table]



This odd-numbered list will result in a "Roll Again" padding item.

[table_poly:4]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
Twenty-one
Twenty-two
Twenty-three
Twenty-four
Twenty-five
Twenty-six
Twenty-seven
Twenty-eight
Twenty-nine
Thirty
Thirty-one
Thirty-two
[end_table]



The following 36 item list will automatically render as a d66 table.

[table_poly:3]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
Twenty-one
Twenty-two
Twenty-three
Twenty-four
Twenty-five
Twenty-six
Twenty-seven
Twenty-eight
Twenty-nine
Thirty
Thirty-one
Thirty-two
Thirty-three
Thirty-four
Thirty-five
Thirty-six
[end_table]

## D66 Test

[table_d66]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
Twenty-one
Twenty-two
Twenty-three
Twenty-four
Twenty-five
Twenty-six
Twenty-seven
Twenty-eight
Twenty-nine
Thirty
Thirty-one
Thirty-two
Thirty-three
Thirty-four
Thirty-five
Thirty-six
[end_table]

## Sequentially Numbered Table

[table_seq:2]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
[end_table]

## D100 Percentile Tables

## Emotions
[table_d100:1]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
[end_table]

[table_d100:2]
One
Two
Three
Four
Five
Six
Seven
Eight
Nine
Ten
Eleven
Twelve
Thirteen
Fourteen
Fifteen
Sixteen
Seventeen
Eighteen
Nineteen
Twenty
[end_table]

## Example of an Inline HTML Table

[raw]
<table style="width:20em;">
  <tr>
    <td>
    <div>First Column</div>
    <div>xoxoxoxo</div>
    <div>xoxoxoxo</div>
    <div>xoxoxoxo</div>
    <div>xoxoxoxo</div>
    <div>xoxoxoxo</div>
    <div>xoxoxoxo</div>
    </td>
    <td>
     <div>Second Column</div>
     <div>yiuyiyiyiyi</div>
     <div>yiuyiyiyiyi</div>
     <div>yiuyiyiyiyi</div>
     <div>yiuyiyiyiyi</div>
    <div>yiuyiyiyiyi</div>
    <div>yiuyiyiyiyi</div>
    </td>
  </tr>
</table>
[end_raw]