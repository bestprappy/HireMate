"use server";

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { insertProblem, getExistingProblemTitles } from "./db";
import { insertTestCases } from "../testCases/db";
import { ProblemTable, JobInfoTable } from "@/drizzle/schema";
import { generateCodingProblem } from "@/services/ai/problems";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface ProblemTemplate {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  examples: string;
  constraints: string;
  functionName: string;
  starterCode?: {
    javascript: string;
    typescript: string;
    python: string;
  };
  referenceSolution?: {
    javascript: string;
    typescript: string;
    python: string;
  };
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
}

const PROBLEM_TEMPLATES: Record<Difficulty, ProblemTemplate[]> = {
  EASY: [
    {
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      inputDescription: "nums: number[], target: number",
      outputDescription: "number[]",
      examples: JSON.stringify([
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ]),
      constraints: "2 <= nums.length <= 10^4",
      functionName: "twoSum",
      starterCode: {
        javascript: `function twoSum(nums, target) {
  // Write your code here
  
}`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your code here
  
}`,
        python: `def twoSum(nums, target):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
      },
      testCases: [
        {
          input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
          expectedOutput: "[0,1]",
          isHidden: false,
        },
        {
          input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
          expectedOutput: "[1,2]",
          isHidden: false,
        },
        {
          input: JSON.stringify({ nums: [3, 3], target: 6 }),
          expectedOutput: "[0,1]",
          isHidden: true,
        },
      ],
    },
    {
      title: "Valid Parentheses",
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and open brackets must be closed in the correct order.",
      inputDescription: "s: string",
      outputDescription: "boolean",
      examples: JSON.stringify([
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" },
      ]),
      constraints: "1 <= s.length <= 10^4",
      functionName: "isValid",
      starterCode: {
        javascript: `function isValid(s) {
  // Write your code here
  
}`,
        typescript: `function isValid(s: string): boolean {
  // Write your code here
  
}`,
        python: `def isValid(s):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function isValid(s) {
  const stack = [];
  const pairs = { '(': ')', '{': '}', '[': ']' };
  for (let char of s) {
    if (pairs[char]) {
      stack.push(char);
    } else {
      const last = stack.pop();
      if (pairs[last] !== char) return false;
    }
  }
  return stack.length === 0;
}`,
        typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  for (let char of s) {
    if (pairs[char]) {
      stack.push(char);
    } else {
      const last = stack.pop();
      if (pairs[last!] !== char) return false;
    }
  }
  return stack.length === 0;
}`,
        python: `def isValid(s):
    stack = []
    pairs = {'(': ')', '{': '}', '[': ']'}
    for char in s:
        if char in pairs:
            stack.append(char)
        else:
            if not stack or pairs[stack.pop()] != char:
                return False
    return len(stack) == 0`,
      },
      testCases: [
        {
          input: JSON.stringify({ s: "()" }),
          expectedOutput: "true",
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: "()[]{}" }),
          expectedOutput: "true",
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: "(]" }),
          expectedOutput: "false",
          isHidden: true,
        },
      ],
    },
    {
      title: "Merge Two Sorted Lists",
      description:
        "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
      inputDescription: "list1: ListNode | null, list2: ListNode | null",
      outputDescription: "ListNode | null",
      examples: JSON.stringify([
        { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
        { input: "list1 = [], list2 = []", output: "[]" },
      ]),
      constraints: "The number of nodes in both lists is in the range [0, 50]",
      functionName: "mergeTwoLists",
      testCases: [
        {
          input: JSON.stringify({ list1: [1, 2, 4], list2: [1, 3, 4] }),
          expectedOutput: "[1,1,2,3,4,4]",
          isHidden: false,
        },
        {
          input: JSON.stringify({ list1: [], list2: [] }),
          expectedOutput: "[]",
          isHidden: false,
        },
      ],
    },
    {
      title: "Best Time to Buy and Sell Stock",
      description:
        "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
      inputDescription: "prices: number[]",
      outputDescription: "number",
      examples: JSON.stringify([
        { input: "prices = [7,1,5,3,6,4]", output: "5" },
        { input: "prices = [7,6,4,3,1]", output: "0" },
      ]),
      constraints: "1 <= prices.length <= 10^5",
      functionName: "maxProfit",
      starterCode: {
        javascript: `function maxProfit(prices) {
  // Write your code here
  
}`,
        typescript: `function maxProfit(prices: number[]): number {
  // Write your code here
  
}`,
        python: `def maxProfit(prices):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}`,
        typescript: `function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}`,
        python: `def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit`,
      },
      testCases: [
        {
          input: JSON.stringify({ prices: [7, 1, 5, 3, 6, 4] }),
          expectedOutput: "5",
          isHidden: false,
        },
        {
          input: JSON.stringify({ prices: [7, 6, 4, 3, 1] }),
          expectedOutput: "0",
          isHidden: false,
        },
      ],
    },
    {
      title: "Valid Palindrome",
      description:
        "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
      inputDescription: "s: string",
      outputDescription: "boolean",
      examples: JSON.stringify([
        { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
        { input: 's = "race a car"', output: "false" },
      ]),
      constraints: "1 <= s.length <= 2 * 10^5",
      functionName: "isPalindrome",
      starterCode: {
        javascript: `function isPalindrome(s) {
  // Write your code here
  
}`,
        typescript: `function isPalindrome(s: string): boolean {
  // Write your code here
  
}`,
        python: `def isPalindrome(s):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
        typescript: `function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
        python: `def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
      },
      testCases: [
        {
          input: JSON.stringify({ s: "A man, a plan, a canal: Panama" }),
          expectedOutput: "true",
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: "race a car" }),
          expectedOutput: "false",
          isHidden: false,
        },
      ],
    },
  ],
  MEDIUM: [
    {
      title: "Longest Substring Without Repeating Characters",
      description:
        "Given a string s, find the length of the longest substring without repeating characters.",
      inputDescription: "s: string",
      outputDescription: "number",
      examples: JSON.stringify([
        { input: 's = "abcabcbb"', output: "3" },
        { input: 's = "bbbbb"', output: "1" },
      ]),
      constraints: "0 <= s.length <= 5 * 10^4",
      functionName: "lengthOfLongestSubstring",
      starterCode: {
        javascript: `function lengthOfLongestSubstring(s) {
  // Write your code here
  
}`,
        typescript: `function lengthOfLongestSubstring(s: string): number {
  // Write your code here
  
}`,
        python: `def lengthOfLongestSubstring(s):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (seen.has(s[i])) {
      start = Math.max(start, seen.get(s[i]) + 1);
    }
    seen.set(s[i], i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}`,
        typescript: `function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();
  let maxLen = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (seen.has(s[i])) {
      start = Math.max(start, seen.get(s[i])! + 1);
    }
    seen.set(s[i], i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}`,
        python: `def lengthOfLongestSubstring(s):
    seen = {}
    max_len = start = 0
    for i, char in enumerate(s):
        if char in seen:
            start = max(start, seen[char] + 1)
        seen[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len`,
      },
      testCases: [
        {
          input: JSON.stringify({ s: "abcabcbb" }),
          expectedOutput: "3",
          isHidden: false,
        },
        {
          input: JSON.stringify({ s: "bbbbb" }),
          expectedOutput: "1",
          isHidden: false,
        },
      ],
    },
    {
      title: "Add Two Numbers",
      description:
        "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
      inputDescription: "l1: ListNode | null, l2: ListNode | null",
      outputDescription: "ListNode | null",
      examples: JSON.stringify([
        { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]" },
        { input: "l1 = [0], l2 = [0]", output: "[0]" },
      ]),
      constraints:
        "The number of nodes in each linked list is in the range [1, 100]",
      functionName: "addTwoNumbers",
      starterCode: {
        javascript: `function addTwoNumbers(l1, l2) {
  // l1 and l2 are arrays representing linked lists
  // Write your code here
  
}`,
        typescript: `function addTwoNumbers(l1: number[], l2: number[]): number[] {
  // l1 and l2 are arrays representing linked lists
  // Write your code here
  
}`,
        python: `def addTwoNumbers(l1, l2):
    # l1 and l2 are arrays representing linked lists
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function addTwoNumbers(l1, l2) {
  const result = [];
  let carry = 0;
  const maxLen = Math.max(l1.length, l2.length);
  for (let i = 0; i < maxLen || carry; i++) {
    const sum = (l1[i] || 0) + (l2[i] || 0) + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }
  return result;
}`,
        typescript: `function addTwoNumbers(l1: number[], l2: number[]): number[] {
  const result: number[] = [];
  let carry = 0;
  const maxLen = Math.max(l1.length, l2.length);
  for (let i = 0; i < maxLen || carry; i++) {
    const sum = (l1[i] || 0) + (l2[i] || 0) + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }
  return result;
}`,
        python: `def addTwoNumbers(l1, l2):
    result = []
    carry = 0
    max_len = max(len(l1), len(l2))
    for i in range(max_len):
        val1 = l1[i] if i < len(l1) else 0
        val2 = l2[i] if i < len(l2) else 0
        total = val1 + val2 + carry
        result.append(total % 10)
        carry = total // 10
    if carry:
        result.append(carry)
    return result`,
      },
    },
    {
      title: "Longest Palindromic Substring",
      description:
        "Given a string s, return the longest palindromic substring in s.",
      inputDescription: "s: string",
      outputDescription: "string",
      examples: JSON.stringify([
        { input: 's = "babad"', output: '"bab" or "aba"' },
        { input: 's = "cbbd"', output: '"bb"' },
      ]),
      constraints: "1 <= s.length <= 1000",
      functionName: "longestPalindrome",
      starterCode: {
        javascript: `function longestPalindrome(s) {
  // Write your code here
  
}`,
        typescript: `function longestPalindrome(s: string): string {
  // Write your code here
  
}`,
        python: `def longestPalindrome(s):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function longestPalindrome(s) {
  let longest = '';
  for (let i = 0; i < s.length; i++) {
    for (let j of [0, 1]) {
      let left = i, right = i + j;
      while (left >= 0 && right < s.length && s[left] === s[right]) {
        left--; right++;
      }
      const palindrome = s.slice(left + 1, right);
      if (palindrome.length > longest.length) longest = palindrome;
    }
  }
  return longest;
}`,
        typescript: `function longestPalindrome(s: string): string {
  let longest = '';
  for (let i = 0; i < s.length; i++) {
    for (let j of [0, 1]) {
      let left = i, right = i + j;
      while (left >= 0 && right < s.length && s[left] === s[right]) {
        left--; right++;
      }
      const palindrome = s.slice(left + 1, right);
      if (palindrome.length > longest.length) longest = palindrome;
    }
  }
  return longest;
}`,
        python: `def longestPalindrome(s):
    longest = ''
    for i in range(len(s)):
        for j in [0, 1]:
            left, right = i, i + j
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            palindrome = s[left + 1:right]
            if len(palindrome) > len(longest):
                longest = palindrome
    return longest`,
      },
    },
    {
      title: "3Sum",
      description:
        "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
      inputDescription: "nums: number[]",
      outputDescription: "number[][]",
      examples: JSON.stringify([
        { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
        { input: "nums = [0,1,1]", output: "[]" },
      ]),
      constraints: "3 <= nums.length <= 3000",
      functionName: "threeSum",
      starterCode: {
        javascript: `function threeSum(nums) {
  // Write your code here
  
}`,
        typescript: `function threeSum(nums: number[]): number[][] {
  // Write your code here
  
}`,
        python: `def threeSum(nums):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
        typescript: `function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}`,
        python: `def threeSum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result`,
      },
    },
    {
      title: "Container With Most Water",
      description:
        "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
      inputDescription: "height: number[]",
      outputDescription: "number",
      examples: JSON.stringify([
        { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
        { input: "height = [1,1]", output: "1" },
      ]),
      constraints: "n == height.length, 2 <= n <= 10^5",
      functionName: "maxArea",
      starterCode: {
        javascript: `function maxArea(height) {
  // Write your code here
  
}`,
        typescript: `function maxArea(height: number[]): number {
  // Write your code here
  
}`,
        python: `def maxArea(height):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function maxArea(height) {
  let maxArea = 0, left = 0, right = height.length - 1;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxArea;
}`,
        typescript: `function maxArea(height: number[]): number {
  let maxArea = 0, left = 0, right = height.length - 1;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxArea;
}`,
        python: `def maxArea(height):
    max_area = 0
    left, right = 0, len(height) - 1
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        max_area = max(max_area, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_area`,
      },
    },
  ],
  HARD: [
    {
      title: "Median of Two Sorted Arrays",
      description:
        "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      inputDescription: "nums1: number[], nums2: number[]",
      outputDescription: "number",
      examples: JSON.stringify([
        { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
        { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
      ]),
      constraints: "The overall run time complexity should be O(log (m+n))",
      functionName: "findMedianSortedArrays",
      starterCode: {
        javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your code here
  
}`,
        typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Write your code here
  
}`,
        python: `def findMedianSortedArrays(nums1, nums2):
    # Write your code here
    pass`,
      },
      referenceSolution: {
        javascript: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 === 0 ? (merged[mid - 1] + merged[mid]) / 2 : merged[mid];
}`,
        typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 === 0 ? (merged[mid - 1] + merged[mid]) / 2 : merged[mid];
}`,
        python: `def findMedianSortedArrays(nums1, nums2):
    merged = sorted(nums1 + nums2)
    n = len(merged)
    mid = n // 2
    return (merged[mid - 1] + merged[mid]) / 2 if n % 2 == 0 else merged[mid]`,
      },
    },
    {
      title: "Merge k Sorted Lists",
      description:
        "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
      inputDescription: "lists: Array<ListNode | null>",
      outputDescription: "ListNode | null",
      examples: JSON.stringify([
        {
          input: "lists = [[1,4,5],[1,3,4],[2,6]]",
          output: "[1,1,2,3,4,4,5,6]",
        },
        { input: "lists = []", output: "[]" },
      ]),
      constraints: "k == lists.length, 0 <= k <= 10^4",
      functionName: "mergeKLists",
      starterCode: {
        javascript: `function mergeKLists(lists) {
  // lists is an array of sorted arrays
  // Write your code here
  
}`,
        typescript: `function mergeKLists(lists: number[][]): number[] {
  // lists is an array of sorted arrays
  // Write your code here
  
}`,
        python: `def mergeKLists(lists):
    # lists is an array of sorted arrays
    # Write your code here
    pass`,
      },
    },
    {
      title: "Trapping Rain Water",
      description:
        "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      inputDescription: "height: number[]",
      outputDescription: "number",
      examples: JSON.stringify([
        { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
        { input: "height = [4,2,0,3,2,5]", output: "9" },
      ]),
      constraints: "n == height.length, 1 <= n <= 2 * 10^4",
      functionName: "trap",
      starterCode: {
        javascript: `function trap(height) {
  // Write your code here
  
}`,
        typescript: `function trap(height: number[]): number {
  // Write your code here
  
}`,
        python: `def trap(height):
    # Write your code here
    pass`,
      },
    },
    {
      title: "Regular Expression Matching",
      description:
        "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where: '.' Matches any single character. '*' Matches zero or more of the preceding element. The matching should cover the entire input string (not partial).",
      inputDescription: "s: string, p: string",
      outputDescription: "boolean",
      examples: JSON.stringify([
        { input: 's = "aa", p = "a"', output: "false" },
        { input: 's = "aa", p = "a*"', output: "true" },
        { input: 's = "ab", p = ".*"', output: "true" },
      ]),
      constraints: "1 <= s.length <= 20, 1 <= p.length <= 20",
      functionName: "isMatch",
      starterCode: {
        javascript: `function isMatch(s, p) {
  // Write your code here
  
}`,
        typescript: `function isMatch(s: string, p: string): boolean {
  // Write your code here
  
}`,
        python: `def isMatch(s, p):
    # Write your code here
    pass`,
      },
    },
    {
      title: "Minimum Window Substring",
      description:
        "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.",
      inputDescription: "s: string, t: string",
      outputDescription: "string",
      examples: JSON.stringify([
        { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
        { input: 's = "a", t = "a"', output: '"a"' },
        { input: 's = "a", t = "aa"', output: '""' },
      ]),
      constraints: "m == s.length, n == t.length, 1 <= m, n <= 10^5",
      functionName: "minWindow",
      starterCode: {
        javascript: `function minWindow(s, t) {
  // Write your code here
  
}`,
        typescript: `function minWindow(s: string, t: string): string {
  // Write your code here
  
}`,
        python: `def minWindow(s, t):
    # Write your code here
    pass`,
      },
    },
  ],
};

export async function generateProblemsForJobAction(
  jobInfoId: string,
  difficulty: Difficulty
) {
  const { userId } = await getCurrentUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch job info to get job title and description
  const [jobInfo] = await db
    .select()
    .from(JobInfoTable)
    .where(eq(JobInfoTable.id, jobInfoId))
    .limit(1);

  if (!jobInfo) {
    throw new Error("Job not found");
  }

  // Generate problem using AI
  const generatedProblem = await generateCodingProblem(
    jobInfo.title || "Software Engineer",
    jobInfo.description || "Software Engineering position",
    difficulty
  );

  // Remove Python from starter code and reference solution
  const { python: _pythonStarter, ...jstsStarterCode } =
    generatedProblem.starterCode as any;
  const { python: _pythonRef, ...jstsReferenceSolution } =
    generatedProblem.referenceSolution as any;

  const problem: typeof ProblemTable.$inferInsert = {
    jobInfoId,
    title: generatedProblem.title,
    description: generatedProblem.description,
    difficulty,
    inputDescription: generatedProblem.inputDescription,
    outputDescription: generatedProblem.outputDescription,
    examples: generatedProblem.examples,
    constraints: generatedProblem.constraints,
    supportedLanguages: ["javascript", "typescript"],
    starterCode: jstsStarterCode,
    referenceSolution: jstsReferenceSolution,
    functionName: generatedProblem.functionName,
  };

  const newProblem = await insertProblem(problem);

  // Create test cases
  if (generatedProblem.testCases && generatedProblem.testCases.length > 0) {
    const testCasesToInsert = generatedProblem.testCases.map((tc) => ({
      problemId: newProblem.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
    }));

    await insertTestCases(testCasesToInsert);
  }

  return { success: true, problemId: newProblem.id };
}
